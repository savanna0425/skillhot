function namesFor(skills) {
  return new Set((skills || []).map((skill) => String(skill.fullName || '').toLowerCase()))
}

function sortedNames(skills) {
  return (skills || []).map((skill) => String(skill.fullName || '').toLowerCase()).sort()
}

function hasReplacementCharacter(value) {
  return /�/.test(String(value || ''))
}

export async function validateCatalogIntegrity({ data, lite, categoryPayloads = {} }) {
  const fullNames = namesFor(data.skills)
  const liteNames = namesFor(lite.skills)
  if (fullNames.size !== liteNames.size || [...fullNames].some((name) => !liteNames.has(name))) {
    throw new Error('Catalog repository set mismatch between skills.json and skills-lite.json')
  }
  if (data.meta.repositories !== data.skills.length || lite.meta.repositories !== lite.skills.length) {
    throw new Error('Catalog repository count does not match the generated skill arrays')
  }

  const categoryNames = new Set(data.categories.map((category) => category.name))
  const expectedTotal = data.skills.length
  const actualTotal = data.categories.reduce((sum, category) => sum + Number(category.count), 0)
  if (actualTotal !== expectedTotal) throw new Error(`Category counts sum to ${actualTotal}, expected ${expectedTotal}`)

  const fullCategories = new Map(data.skills.map((skill) => [String(skill.fullName).toLowerCase(), skill.category]))
  for (const skill of data.skills) {
    if (hasReplacementCharacter(`${skill.fullName} ${skill.category} ${skill.summary}`)) {
      throw new Error(`Replacement character found for ${skill.fullName}`)
    }
  }
  for (const skill of lite.skills) {
    if (hasReplacementCharacter(`${skill.fullName} ${skill.category} ${skill.summary}`)) {
      throw new Error(`Replacement character found for ${skill.fullName}`)
    }
    if (!categoryNames.has(skill.category)) throw new Error(`Unknown category ${skill.category} for ${skill.fullName}`)
    if (fullCategories.get(String(skill.fullName).toLowerCase()) !== skill.category) {
      throw new Error(`Category mismatch for ${skill.fullName} between skills.json and skills-lite.json`)
    }
  }

  for (const category of data.categories) {
    const payload = categoryPayloads[category.name]
    if (!payload) throw new Error(`Missing ${category.name} category shard`)
    const expected = sortedNames(data.skills.filter((skill) => skill.category === category.name))
    const actual = sortedNames(payload.skills)
    for (const skill of payload.skills || []) {
      if (hasReplacementCharacter(`${skill.fullName} ${skill.category} ${skill.summary}`)) {
        throw new Error(`Replacement character found for ${skill.fullName}`)
      }
      if (skill.category !== category.name) throw new Error(`${category.name} category shard contains ${skill.fullName} with the wrong category`)
    }
    if (actual.length !== category.count || actual.join('\n') !== expected.join('\n')) {
      throw new Error(`${category.name} category shard count or repository set mismatch`)
    }
  }
}
