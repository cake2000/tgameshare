import Papa from 'papaparse';
import { Schools } from '/lib/collections';

const insertSchools = () => {
  Schools.remove({});
  const data = Assets.getText('School/SchoolList.csv');
  const schoolsData = Papa.parse(data, { header: true });

  Schools.batchInsert(schoolsData.data);
};

export default insertSchools;
