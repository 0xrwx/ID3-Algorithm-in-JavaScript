const { ID3 } = require("./ID3_Algorithm");
const fs = require('fs');
const Papa = require('papaparse');

fs.readFile('online_shopping_2.csv', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  const examples = Papa.parse(data).data;
  const targetAttribute = 4;
  // const attributes = new Map([
  //   [0, 'sepal.length'],
  //   [1, 'sepal.width'],
  //   [2, 'petal.length'],
  //   [3, 'petal.width'],
  // ])
  const attributes = new Map([
    [0, 'year'],
    [1, 'month'],
    [2, 'day'],
    [3, 'order'],
    [6, 'page 1 (main category)'],
    [7, 'page 2 (clothing model)'],
    [8, 'colour'],
    [9, 'model photography'],
    [10, 'price'],
    [11, 'price 2'],
    [12, 'page'],
  ])

  function replace_symbolic_with_ordinal(examples, index) {
    function getUniqueValues(data, attribute) {
      const values = {};
      data.forEach(item => {
        const value = item[attribute];
        if (!values[value])
          values[value] = value;
      });
      return Object.keys(values);
    }
  
    const map = new Map();
  
    const unique = getUniqueValues(examples, index);
    unique.forEach((value, index) =>
      map.set(value, index)
    );
  
    const result = examples.map(value => {
      value[index] = map.get(value[index])
    })
  
    return result;
  }

  function discretization_equal(examples, exec) {

    // const minValues = examples[0].map((_, columnIndex) => Math.min(...examples.map(row => row[columnIndex])));
    const maxValues = examples[0].map((_, columnIndex) => (
      Math.max(...examples.map(row => 
        row[columnIndex]
      ))
    ));
    const minValues = examples[0].map((_, columnIndex) => (
      Math.min(...examples.map(row => 
        row[columnIndex]
      ))
    ));

    const sumArray = minValues.map((value, index) => value + maxValues[index]);
    const sumArray_by_2 = sumArray.map(x => x / 2)
    // const exec = [4];

    const result = examples.map((row, rowIndex) =>
      row.map((value, colIndex) => {
        if (!exec.includes(colIndex)) {
          if (value < sumArray_by_2[colIndex]) {
            return `<${sumArray_by_2[colIndex]}`;
          } else {
            return `>${sumArray_by_2[colIndex]}`;
          }
        } else {
          return value;
        }
      })
    );
    return result;
  }

  function splitArray(array, splitRatio) {
    const splitIndex = Math.floor(array.length * splitRatio);
    const firstArray = array.slice(0, splitIndex);
    const secondArray = array.slice(splitIndex);
    return [firstArray, secondArray];
  }

  replace_symbolic_with_ordinal(examples, 7)

  const exec = [0, 1, 4, 6, 9, 10, 12, 13]
  // const exec = [4]
  const discretizedExamples = discretization_equal(examples, exec);

  const [train, test] = splitArray(discretizedExamples, 0.8);

  const decisionTree = ID3(train, targetAttribute, attributes);
  console.log(decisionTree);

  // console.log(discretizedExamples)

  function predict(data, graph, target) {
    function p(example, tree) {
      if (tree.label) {
        return tree.label
      } else {
        v = example[tree.index]
        new_tree = tree[v]
        return p(example, new_tree)
       }
     }
  
    const ex = Array(data.length).fill(0);
  
    data.forEach((element, index) => {
      ex[index] = p(element, graph) === element[target];
    });
  
    const sum = ex.reduce((a, b) => a + b, 0 );

    return sum / data.length;
  }

  console.log(`${predict(test, decisionTree, 4) * 100}%`)

  // console.log("80% train:", train.length);
  // console.log("20% test:", test.length);
});