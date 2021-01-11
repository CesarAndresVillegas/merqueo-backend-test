exports.getCurrentDenominations = async (connection) => {
  let conn = connection;
  return new Promise((resolve, reject) => {
    conn.query(
      `SELECT id, quantity
        FROM cashbox
        WHERE quantity > 0
        ORDER BY id;`,
      function (error, results) {
        if (error) reject(error);
        resolve(results);
      }
    );
  });
};
