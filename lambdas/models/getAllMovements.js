exports.getAllMovements = async (connection) => {
  let conn = connection;
  return new Promise((resolve, reject) => {
    conn.query(
      `SELECT m.id AS movement_id, md.id AS movement_detail_id, m.payment, m.cash_back,
         o.name AS operation, c.denomination, c.value, md.quantity, deop.name AS movement,
         m.created_at
        FROM movements m JOIN movements_details md
        JOIN operations o ON m.operations_id = o.id
        JOIN cashbox c ON c.id = md.cashbox_id
        JOIN detail_operation deop ON deop.id = md.detail_operation_id 
        ORDER BY md.id DESC;`,
      function (error, results) {
        let response = {};
        if (error) {
          response = {
            statusCode: 501,
            body: JSON.stringify({ results: error }),
          };
          reject(response);
        }
        conn.end();
        response = {
          statusCode: 200,
          body: JSON.stringify({ results: results }),
        };
        resolve(response);
      }
    );
  });
};
