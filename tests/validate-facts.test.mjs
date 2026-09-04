import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { spawnSync } from "node:child_process"

const root = new URL("../", import.meta.url)
const validator = await import(new URL("scripts/validate-facts.mjs", root))

function readJson(path) {
  try {
    return JSON.parse(readFileSync(new URL(path, root), "utf8"))
  } catch {
    return null
  }
}

test("one canonical path owns each public search intent", () => {
  const facts = readJson("facts/product-routes.json")
  assert.ok(facts, "facts/product-routes.json must exist")
  assert.equal(new Set(facts.intents.map(item => item.intent)).size, facts.intents.length)
  assert.equal(new Set(facts.intents.map(item => item.path)).size, facts.intents.length)
  assert.deepEqual(facts.forbiddenPaths, [
    "/wechat-formatting-api",
    "/wechat-formatting-skill",
  ])
})

test("Convert API and Publishing API keep different side-effect boundaries", () => {
  const facts = readJson("facts/product-routes.json")
  assert.ok(facts, "facts/product-routes.json must exist")
  assert.equal(facts.products.convertApi.endpoint, "https://www.md2wechat.cn/api/convert")
  assert.equal(facts.products.convertApi.createsDraft, false)
  assert.equal(facts.products.publishingApi.endpoint, "https://md2wechat.com/api/v1")
  assert.equal(facts.products.publishingApi.createsDraft, true)
})

test("the validator accepts the repository contracts and rendered profile", () => {
  const result = spawnSync(process.execPath, ["scripts/validate-facts.mjs"], {
    cwd: root,
    encoding: "utf8",
  })
  assert.equal(result.status, 0, result.stderr || result.stdout)
})


test("public profile uses reader-facing language", () => {
  const profile = readFileSync(new URL("profile/README.md", root), "utf8")
  const internalTerms = [
    "最短可验证路径",
    "产品关系",
    "平台兼容性",
    "smoke",
    "publiclySupported",
    "Discovery 输出",
    "失效条件",
    "核验基线",
    "状态注册表",
    "副作用",
    "未经复核的支持关系",
    "状态与证据",
  ]
  for (const term of internalTerms) {
    assert.equal(profile.includes(term), false, `profile must not contain internal term: ${term}`)
  }
})

test("public profile uses real Markdown line breaks", () => {
  const profile = readFileSync(new URL("profile/README.md", root), "utf8")
  assert.equal(profile.includes("\\n"), false, "profile must not contain literal escaped line breaks")
})

test("profile guard distinguishes negative Convert API draft wording from claims", () => {
  const facts = readJson("facts/product-routes.json")
  for (const profile of [
    "Convert API 不创建草稿",
    "Convert API 只转换内容，不会生成草稿",
  ]) {
    assert.doesNotMatch(
      validator.validateProfile(profile, facts).join("\n"),
      /profile confuses Convert API with draft creation/,
    )
  }
  assert.match(
    validator.validateProfile("Convert API 可以创建草稿", facts).join("\n"),
    /profile confuses Convert API with draft creation/,
  )
})

test("the validator reports immutable source SHA drift", () => {
  const fixture = JSON.stringify({
    schemaVersion: 1,
    reviewedAt: "2026-09-04",
    sources: {
      runtime: {
        repository: "geekjourneyx/md2wechat-skill",
        path: "docs/contracts/runtime-facts.v1.json",
        sha: "1111111111111111111111111111111111111111",
        schemaVersion: "v1",
      },
      products: {
        repository: "md2wechat/.github",
        path: "facts/product-routes.json",
        sha: "2222222222222222222222222222222222222222",
        schemaVersion: 1,
      },
      platforms: {
        repository: "md2wechat/md2wechat-wiki",
        path: "evidence/agent-platforms.json",
        sha: "3333333333333333333333333333333333333333",
        schemaVersion: 1,
      },
    },
  })
  const actual = JSON.stringify({
    runtime: { sha: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" },
    products: { sha: "2222222222222222222222222222222222222222" },
    platforms: { sha: "3333333333333333333333333333333333333333" },
  })
  const result = spawnSync(
    process.execPath,
    ["scripts/validate-facts.mjs", "--check-lock", fixture, "--sources", actual],
    { cwd: root, encoding: "utf8" },
  )
  assert.equal(result.status, 1)
  assert.match(result.stderr, /runtime: expected 1111111.*actual aaaaaaa/)
})

test("published schemas enforce the product and consumer-lock boundaries", () => {
  const products = readJson("facts/schemas/product-routes.schema.json")
  const lock = readJson("facts/schemas/ecosystem-lock.schema.json")
  assert.ok(products, "product-routes schema must exist")
  assert.ok(lock, "ecosystem-lock schema must exist")
  assert.equal(products.$schema, "https://json-schema.org/draft/2020-12/schema")
  assert.equal(products.properties.products.required.includes("convertApi"), true)
  assert.equal(products.properties.products.required.includes("publishingApi"), true)
  assert.equal(
    products.properties.products.properties.convertApi.properties.createsDraft.const,
    false,
  )
  assert.equal(
    products.properties.products.properties.publishingApi.properties.createsDraft.const,
    true,
  )
  assert.deepEqual(lock.properties.sources.required.sort(), ["platforms", "products", "runtime"])
  assert.equal(lock.$defs.source.properties.sha.pattern, "^[0-9a-f]{40}$")
})

test("runtime schema validation rejects semantic and structural product drift", () => {
  assert.equal(
    typeof validator.validateAgainstSchema,
    "function",
    "validator must execute the published JSON Schema",
  )
  const facts = readJson("facts/product-routes.json")
  const schema = readJson("facts/schemas/product-routes.schema.json")

  const wrongRole = structuredClone(facts)
  wrongRole.products.convertApi.role = "core-product"
  assert.match(validator.validateAgainstSchema(wrongRole, schema).join("\n"), /role.*const/)

  const impossibleDate = structuredClone(facts)
  impossibleDate.reviewedAt = "2026-99-99"
  assert.match(validator.validateAgainstSchema(impossibleDate, schema).join("\n"), /reviewedAt.*date/)

  const extraField = structuredClone(facts)
  extraField.products.cli.unreviewedClaim = true
  assert.match(
    validator.validateAgainstSchema(extraField, schema).join("\n"),
    /unreviewedClaim.*additional property/,
  )
})

test("runtime schema validation rejects incomplete consumer locks", () => {
  assert.equal(typeof validator.validateAgainstSchema, "function")
  const schema = readJson("facts/schemas/ecosystem-lock.schema.json")
  const incomplete = {
    schemaVersion: 1,
    sources: {
      runtime: { sha: "1".repeat(40) },
      products: { sha: "2".repeat(40) },
      platforms: { sha: "3".repeat(40) },
    },
  }
  const errors = validator.validateAgainstSchema(incomplete, schema).join("\n")
  assert.match(errors, /reviewedAt.*required/)
  assert.match(errors, /repository.*required/)
  assert.match(errors, /path.*required/)
  assert.match(errors, /schemaVersion.*required/)
})

test("profile gate catches compatibility wording variants", () => {
  const facts = readJson("facts/product-routes.json")
  const profile = readFileSync(new URL("profile/README.md", root), "utf8")
  for (const claim of ["支持 WorkBuddy", "兼容 WorkBuddy", "已接入豆包工作"]) {
    assert.match(validator.validateProfile(`${profile}\n${claim}`, facts).join("\n"), /platform/i)
  }
})

test("validator can be imported when argv has no script path", () => {
  const result = spawnSync(
    process.execPath,
    ["--input-type=module", "-e", "process.argv.splice(1); await import('./scripts/validate-facts.mjs')"],
    { cwd: root, encoding: "utf8" },
  )
  assert.equal(result.status, 0, result.stderr)
})
