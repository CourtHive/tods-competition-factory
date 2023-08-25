export const category = {
  ageMax: '{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',
  ageMaxDate:
    '{\\"type\\":\\"string\\",\\"required\\":\\"true\\",\\"note\\":\\"\'YYYY-MM-DD\'\\"}',
  ageMin: '{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',
  ageMinDate:
    '{\\"type\\":\\"string\\",\\"required\\":\\"true\\",\\"note\\":\\"\'YYYY-MM-DD\'\\"}',
  ageCategoryCode:
    '{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"e.g. U12, 12U, C50-70\\"}',
  ballType:
    '{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"false\\"}',
  categoryName: '{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',
  ratingMax: '{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',
  ratingMin: '{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',
  ratingType:
    '{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"ratings provider\\"}',
  subType:
    '{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"e.g. ADULT, JUNIOR, SENIOR\\"}',
  type: '{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"false\\",\\"note\\":\\"e.g. AGE, RATING, BOTH\\"}',
};

export default category;
