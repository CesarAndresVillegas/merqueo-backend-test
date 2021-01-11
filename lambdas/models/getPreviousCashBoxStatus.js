exports.getPreviousCashBoxStatus = async (dateRequired, connection) => {
  let conn = connection;
  return new Promise((resolve, reject) => {
    conn.query(
      `SELECT m.id, m.payment, m.cash_back, m.operations_id, m.created_at, md.cashbox_id,
         md.detail_operation_id, md.quantity, c.denomination
        FROM movements m
        JOIN movements_details md ON m.id = md.movements_id
        JOIN cashbox c ON c.id = md.cashbox_id
        WHERE m.created_at <= "${dateRequired}"
        ORDER BY m.created_at DESC;`,
      function (error, results) {
        let response = {};
        conn.end();
        if (error) {
          response = {
            statusCode: 501,
            body: JSON.stringify({ results: error }),
          };
          reject(response);
        }
        response = {
          statusCode: 200,
          body: JSON.stringify({ results: results }),
        };
        resolve(response);
      }
    );
  });
};
