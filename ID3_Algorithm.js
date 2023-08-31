let operation = 0;

function ID3(examples, targetAttribute, attributes) { // opartion of fuck up is 10~~!!~~!!~~!!~~!!~~!!~~!!~~!!~~!!~~!!~~!!~~!!~~!!~~!!~~!!~~!!~~!!~~!!~~!!~~!!
  operation += 1;

  // Create a Root node for the tree
  const root = {};

  // If attributes is empty, return the single-node tree with label = most common value of targetAttribute in examples
  if (attributes.size === 0) {
    root.label = mostCommonValue(examples, targetAttribute);
    return root;
  }

  if (allExamplesSame(examples, targetAttribute)) {
    root.label = allExamplesSame(examples, targetAttribute);
    return root;
  }

  // A is the attribute, from attributes that "best" classifies examples
  const A = chooseBestAttribute(examples, attributes, targetAttribute);
  // The decision attribute for root A
  root.attribute = attributes.get(A);
  root.index = A;

  // For each possible value vi of A (where 'v' is a value and 'i' is an index)
  const attributeValues = getUniqueValues(examples, A);
  attributeValues.forEach(vi => {
    // Let examples_vi be the subset of examples that have value vi for A
    const examples_vi = getExamplesWithValue(examples, A, vi);

    // If examples_vi is empty
    if (examples_vi.size === 0) {
      // Below this new branch, add a leaf node with label = most common value of targetAttribute in examples
      root[vi] = mostCommonValue(examples, targetAttribute);
      // return root
    } else {
      // Below this new branch, add the subtree ID3(examples_vi, targetAttribute, attributes - A)
      attributes.delete(A);
      root[vi] = ID3(examples_vi, targetAttribute, attributes);
    }
  });

  return root;
}

// Helper functions used by ID3 algorithm

function allExamplesSame(examples, targetAttribute) {
  const lastItemValue = examples[0][targetAttribute];

  const allSameLastItem = examples.every((example) => example[targetAttribute] === lastItemValue);

  if (allSameLastItem) {
    return lastItemValue;
  } else {
    return false
  }
}

function mostCommonValue(examples, attribute) {
  const valueCounts = {};
  examples.forEach(example => {
    const value = example[attribute];
    valueCounts[value] = (valueCounts[value] || 0) + 1;
  });
  const mostCommonValue = Object.keys(valueCounts).reduce((a, b) => 
    valueCounts[a] > valueCounts[b] ? a : b
  );
  return mostCommonValue;
}

function chooseBestAttribute(examples, attributes, targetAttribute) {
  const map = new Map();

  Array.from(attributes.keys()).forEach(attribute => {
    const informationGain = calculateInformationGain(examples, attribute, targetAttribute);
    map.set(informationGain, attribute)
  });

  const bestAttribute = map.get(Math.max(...map.keys()))

  return bestAttribute;
}

function calculateInformationGain(examples, attribute, targetAttribute) {
  const totalEntropy = calculateEntropy(examples, targetAttribute);
  const attributeValues = getUniqueValues(examples, attribute);
  let attributeEntropy = 0;

  attributeValues.forEach(value => {
    const examplesWithValue = getExamplesWithValue(examples, attribute, value);
    const valueProbability = examplesWithValue.length / examples.length;
    const valueEntropy = calculateEntropy(examplesWithValue, targetAttribute);
    attributeEntropy += valueProbability * valueEntropy;
  });

  const informationGain = totalEntropy - attributeEntropy;
  return informationGain;
}

function calculateEntropy(examples, targetAttribute) {
  const valueCounts = {};
  examples.forEach(example => {
    const value = example[targetAttribute];
    valueCounts[value] = (valueCounts[value] || 0) + 1;
  });

  let entropy = 0;
  const totalExamples = examples.length;

  Object.keys(valueCounts).forEach(value => {
    const probability = valueCounts[value] / totalExamples;
    entropy -= probability * Math.log2(probability);
  });

  return entropy;
}

function getUniqueValues(examples, attribute) {
  const values = {};
  examples.forEach(example => {
    const value = example[attribute];
    if (!values[value])
      values[value] = value;
  });
  return Object.keys(values);
}

function getExamplesWithValue(examples, attribute, value) {
  return examples.filter(example => 
    example[attribute] === value
  );
}

module.exports = { ID3 }