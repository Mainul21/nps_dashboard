/**
 * NPS Data Store
 * Shared in-memory storage for NPS records
 */

let records = [];

module.exports = {
  /**
   * Get all NPS records
   */
  getRecords: function () {
    return records;
  },

  /**
   * Add a new NPS record
   */
  addRecord: function (data) {
    records.push({ data });
    return records.length;
  },

  /**
   * Clear all records
   */
  clearRecords: function () {
    records = [];
  },

  /**
   * Get records filtered by account/business unit
   */
  getRecordsByAccount: function (accountName) {
    return records.filter(
      (r) =>
        r.data?.["Account Name"]?.toLowerCase() ===
        accountName.toLowerCase()
    );
  },

  /**
   * Get records count
   */
  getCount: function () {
    return records.length;
  },
};
