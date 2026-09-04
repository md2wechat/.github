import { readFileSync } from "node:fs"
import { pathToFileURL } from "node:url"

const SHA_RE = /^[0-9a-f]{40}$/
const REQUIRED_PRODUCTS = ["cli", "skill", "convertApi", "publishingApi", "onlineEditor"]
const REQUIRED_SOURCES = ["runtime", "products", "platforms"]

function schemaAtRef(rootSchema, ref) {
  if (!ref.startsWith("#/")) throw new Error(`unsupported schema reference: ${ref}`)
  return ref.slice(2).split("/").reduce((node, part) => {
    const key = part.replaceAll("~1", "/").replaceAll("~0", "~")
    return node?.[key]
  }, rootSchema)
}

function isType(value, type) {
  if (type === "object") return value !== null && typeof value === "object" && !Array.isArray(value)
  if (type === "array") return Array.isArray(value)
  if (type === "integer") return Number.isInteger(value)
  if (type === "null") return value === null
  return typeof value === type
}

function isDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value
}

function walkSchema(value, schema, rootSchema, path, errors) {
  if (!schema || typeof schema !== "object") {
    errors.push(`${path}: invalid schema node`)
    return
  }
  if (schema.$ref) {
    const target = schemaAtRef(rootSchema, schema.$ref)
    if (!target) errors.push(`${path}: unresolved schema reference ${schema.$ref}`)
    else walkSchema(value, target, rootSchema, path, errors)
  }
  for (const child of schema.allOf ?? []) walkSchema(value, child, rootSchema, path, errors)

  if (schema.type) {
    const allowed = Array.isArray(schema.type) ? schema.type : [schema.type]
    if (!allowed.some(type => isType(value, type))) {
      errors.push(`${path}: expected type ${allowed.join("|")}`)
      return
    }
  }
  if (Object.hasOwn(schema, "const") && JSON.stringify(value) !== JSON.stringify(schema.const)) {
    errors.push(`${path}: must equal const ${JSON.stringify(schema.const)}`)
  }
  if (schema.enum && !schema.enum.some(item => JSON.stringify(item) === JSON.stringify(value))) {
    errors.push(`${path}: must match enum`)
  }

  if (typeof value === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push(`${path}: shorter than minLength ${schema.minLength}`)
    }
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
      errors.push(`${path}: does not match pattern ${schema.pattern}`)
    }
    if (schema.format === "date" && !isDate(value)) errors.push(`${path}: invalid date`)
    if (schema.format === "uri") {
      try {
        new URL(value)
      } catch {
        errors.push(`${path}: invalid uri`)
      }
    }
  }

  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      errors.push(`${path}: fewer than minItems ${schema.minItems}`)
    }
    if (schema.uniqueItems) {
      const encoded = value.map(item => JSON.stringify(item))
      if (new Set(encoded).size !== encoded.length) errors.push(`${path}: items must be unique`)
    }
    if (schema.items) value.forEach((item, index) => walkSchema(item, schema.items, rootSchema, `${path}[${index}]`, errors))
  }

  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    for (const key of schema.required ?? []) {
      if (!Object.hasOwn(value, key)) errors.push(`${path}.${key}: required property missing`)
    }
    for (const [key, child] of Object.entries(schema.properties ?? {})) {
      if (Object.hasOwn(value, key)) walkSchema(value[key], child, rootSchema, `${path}.${key}`, errors)
    }
    if (schema.additionalProperties === false) {
      const allowed = new Set(Object.keys(schema.properties ?? {}))
      for (const key of Object.keys(value)) {
        if (!allowed.has(key)) errors.push(`${path}.${key}: additional property is not allowed`)
      }
    }
  }
}

export function validateAgainstSchema(value, schema) {
  const errors = []
  walkSchema(value, schema, schema, "$", errors)
  return [...new Set(errors)]
}

export function validateProductRoutes(facts) {
  const errors = []
  if (facts?.schemaVersion !== 1) errors.push("schemaVersion must be 1")
  if (!/^\d{4}-\d{2}-\d{2}$/.test(facts?.reviewedAt ?? "")) {
    errors.push("reviewedAt must use YYYY-MM-DD")
  }

  for (const id of REQUIRED_PRODUCTS) {
    const product = facts?.products?.[id]
    if (!product) {
      errors.push(`missing product: ${id}`)
      continue
    }
    if (!product.entry?.startsWith("https://")) errors.push(`${id}.entry must use https`)
  }

  if (facts?.products?.convertApi?.endpoint !== "https://www.md2wechat.cn/api/convert") {
    errors.push("Convert API endpoint drift")
  }
  if (facts?.products?.convertApi?.createsDraft !== false) {
    errors.push("Convert API must not claim draft creation")
  }
  if (facts?.products?.publishingApi?.endpoint !== "https://md2wechat.com/api/v1") {
    errors.push("Publishing API endpoint drift")
  }
  if (facts?.products?.publishingApi?.createsDraft !== true) {
    errors.push("Publishing API must retain draft capability")
  }

  const intents = facts?.intents ?? []
  if (new Set(intents.map(item => item.intent)).size !== intents.length) {
    errors.push("duplicate intent owner")
  }
  if (new Set(intents.map(item => item.path)).size !== intents.length) {
    errors.push("duplicate canonical path")
  }
  const forbidden = new Set(facts?.forbiddenPaths ?? [])
  for (const item of intents) {
    if (forbidden.has(item.path)) errors.push(`forbidden canonical path: ${item.path}`)
  }
  return errors
}

export function checkLock(lock, actualSources) {
  const drift = []
  for (const source of REQUIRED_SOURCES) {
    const expected = lock?.sources?.[source]?.sha
    const actual = actualSources?.[source]?.sha
    if (!SHA_RE.test(expected ?? "")) {
      drift.push({ source, expected: expected ?? "missing", actual: actual ?? "missing", reason: "invalid-lock-sha" })
    } else if (!SHA_RE.test(actual ?? "")) {
      drift.push({ source, expected, actual: actual ?? "missing", reason: "invalid-source-sha" })
    } else if (expected !== actual) {
      drift.push({ source, expected, actual, reason: "sha-drift" })
    }
  }
  return { ok: drift.length === 0, drift }
}

export function validateProfile(profile, facts) {
  const errors = []
  const requiredLinks = [
    facts.products.onlineEditor.entry,
    facts.products.cli.entry,
    facts.products.convertApi.entry,
    facts.products.publishingApi.entry,
    facts.ecosystem.guide,
    facts.ecosystem.templates,
    facts.ecosystem.awesome,
    facts.ecosystem.wiki,
  ]
  for (const link of requiredLinks) {
    if (!profile.includes(`](${link})`)) errors.push(`profile missing route: ${link}`)
  }
  const platform = "(?:千问办公|WorkBuddy|DuMate|豆包工作)"
  const claim = new RegExp(`(?:支持|兼容|已接入).{0,12}${platform}|${platform}.{0,12}(?:支持|兼容|已接入)`, "i")
  if (claim.test(profile)) {
    errors.push("profile contains an evidence-gated platform support claim")
  }
  const convertDraftClaims = profile.match(/Convert API[^。！？\n]*/g) ?? []
  for (const sentence of convertDraftClaims) {
    const withoutNegativeClaims = sentence.replaceAll(
      /(?:不|不会|不能|不提供|未)(?:创建|生成)[^。！？\n]{0,8}草稿/g,
      "",
    )
    if (/(?:创建|生成)[^。！？\n]{0,8}草稿/.test(withoutNegativeClaims)) {
      errors.push("profile confuses Convert API with draft creation")
      break
    }
  }
  return errors
}

function parseFlag(name) {
  const index = process.argv.indexOf(name)
  return index === -1 ? null : process.argv[index + 1]
}

function run() {
  const lockArg = parseFlag("--check-lock")
  if (lockArg) {
    const sourcesArg = parseFlag("--sources")
    if (!sourcesArg) throw new Error("--sources is required with --check-lock")
    const lock = JSON.parse(lockArg)
    const lockSchema = JSON.parse(readFileSync(new URL("../facts/schemas/ecosystem-lock.schema.json", import.meta.url), "utf8"))
    const schemaErrors = validateAgainstSchema(lock, lockSchema)
    if (schemaErrors.length) {
      for (const error of schemaErrors) console.error(error)
      process.exitCode = 1
      return
    }
    const result = checkLock(lock, JSON.parse(sourcesArg))
    if (!result.ok) {
      for (const item of result.drift) {
        console.error(`${item.source}: expected ${item.expected}; actual ${item.actual}; ${item.reason}`)
      }
      process.exitCode = 1
    }
    return
  }

  const facts = JSON.parse(readFileSync(new URL("../facts/product-routes.json", import.meta.url), "utf8"))
  const factsSchema = JSON.parse(readFileSync(new URL("../facts/schemas/product-routes.schema.json", import.meta.url), "utf8"))
  const profile = readFileSync(new URL("../profile/README.md", import.meta.url), "utf8")
  const errors = [
    ...validateAgainstSchema(facts, factsSchema),
    ...validateProductRoutes(facts),
    ...validateProfile(profile, facts),
  ]
  if (errors.length) {
    for (const error of errors) console.error(error)
    process.exitCode = 1
    return
  }
  console.log("facts valid")
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    run()
  } catch (error) {
    console.error(`facts validation failed: ${error.message}`)
    process.exitCode = 1
  }
}
