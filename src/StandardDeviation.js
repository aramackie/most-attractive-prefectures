const standardDeviation = (data) => {
  const average = (data) => {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum = sum + data[i];
    }
    return (sum / data.length);
  }

  const variance = (data) => {
    let ave = average(data);
    let varia = 0;
    for (let i = 0; i < data.length; i++) {
      varia = varia + Math.pow(data[i] - ave, 2);
    }
    return (varia / data.length);
  }

  let varia = variance(data);
  return Math.sqrt(varia);
}

export default standardDeviation;