exports.getAllDenominationsCurrentQuantity = async (connection) => {
  let conn = connection;
  return new Promise((resolve, reject) => {
    conn.query(
      `SELECT id, quantity, value, denomination, 0 AS subtracted
        FROM cashbox
        ORDER BY id;`,
      function (error, results) {
        if (error) reject(error);
        resolve(results);
      }
    );
  });
};
