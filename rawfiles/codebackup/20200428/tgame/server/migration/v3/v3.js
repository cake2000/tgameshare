/* global Migrations */
import updatePaymentData from './updatePaymentData';
import prepareUpgradeAccountAdminData from './prepareUpgradeAccountAdminData';

Migrations.add({
  version: 3,
  name: 'Prepare payment data',
  up() {
    updatePaymentData();
    prepareUpgradeAccountAdminData();
  },
  down() {
    // code to migrate down to version 2
  }

});
