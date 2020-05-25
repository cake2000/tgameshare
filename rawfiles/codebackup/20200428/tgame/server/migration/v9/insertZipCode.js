import { ZipCode } from '../../../lib/collections';
import ZipCodeData from './ZipCodeData.json';

export default function insertZipCode() {
  ZipCode.remove({});
  ZipCode.batchInsert(ZipCodeData);
}
