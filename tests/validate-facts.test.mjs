import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { spawnSync } from "node:child_process"

const root = new URL("../", import.meta.url)

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

test("the validator reports immutable source SHA drift", () => {
  const fixture = JSON.stringify({
    schemaVersion: 1,
    sources: {
      runtime: { sha: "1111111111111111111111111111111111111111" },
      products: { sha: "2222222222222222222222222222222222222222" },
      platforms: { sha: "3333333333333333333333333333333333333333" },
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
