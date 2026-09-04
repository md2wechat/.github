import { readFileSync } from "node:fs"
import { pathToFileURL } from "node:url"

const SHA_RE = /^[0-9a-f]{40}$/
const REQUIRED_PRODUCTS = ["cli", "skill", "convertApi", "publishingApi", "onlineEditor"]
const REQUIRED_SOURCES = ["runtime", "products", "platforms"]

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
  if (/支持(?:千问办公|WorkBuddy|DuMate|豆包工作)/.test(profile)) {
    errors.push("profile contains an evidence-gated platform support claim")
  }
  if (/Convert API.{0,16}(?:创建|生成).{0,8}草稿/s.test(profile)) {
    errors.push("profile confuses Convert API with draft creation")
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
    const result = checkLock(JSON.parse(lockArg), JSON.parse(parseFlag("--sources") ?? "{}"))
    if (!result.ok) {
      for (const item of result.drift) {
        console.error(`${item.source}: expected ${item.expected}; actual ${item.actual}; ${item.reason}`)
      }
      process.exitCode = 1
    }
    return
  }

  const facts = JSON.parse(readFileSync(new URL("../facts/product-routes.json", import.meta.url), "utf8"))
  const profile = readFileSync(new URL("../profile/README.md", import.meta.url), "utf8")
  const errors = [...validateProductRoutes(facts), ...validateProfile(profile, facts)]
  if (errors.length) {
    for (const error of errors) console.error(error)
    process.exitCode = 1
    return
  }
  console.log("facts valid")
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) run()
