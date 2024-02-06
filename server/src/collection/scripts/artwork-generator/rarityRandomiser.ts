const rarityRandomiser = (elements) => {
  const SUPER_RARE_WEIGHT = 2;
  const RARE_WEIGHT = 5;
  const MEDIUM_WEIGHT = 15;
  const LOW_WEIGHT = 30;
  const BASIC_WEIGHT = 60;

  let rangeIndicators: number[] = [];
  let total: number = 0;

  for (let i = 0; i < elements.length; i++) {
    if (elements[i].rarity == 'Super Rare') {
      rangeIndicators.push(total + SUPER_RARE_WEIGHT);
      total += SUPER_RARE_WEIGHT;
    } else if (elements[i].rarity == 'Rare') {
      rangeIndicators.push(total + RARE_WEIGHT);
      total += RARE_WEIGHT;
    } else if (elements[i].rarity == 'Medium') {
      rangeIndicators.push(total + MEDIUM_WEIGHT);
      total += MEDIUM_WEIGHT;
    } else if (elements[i].rarity == 'Low') {
      rangeIndicators.push(total + LOW_WEIGHT);
      total += LOW_WEIGHT;
    } else {
      rangeIndicators.push(total + BASIC_WEIGHT);
      total += BASIC_WEIGHT;
    }
  }

  const randomNumberInRange: number = Math.floor(Math.random() * total);

  for (let i = 0; i < elements.length; i++) {
    if (randomNumberInRange <= rangeIndicators[i]) return i;
  }
};

export default rarityRandomiser;
