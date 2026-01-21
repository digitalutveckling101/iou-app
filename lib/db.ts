import { sql } from '@vercel/postgres';

export interface Transaction {
  id: number;
  user_id: string;
  person_name: string;
  amount: number;
  type: 'lent_out' | 'borrowed'; // 'lent_out' = jag lånade ut, 'borrowed' = jag lånade
  description?: string;
  transaction_date: Date;
  due_date?: Date;
  created_at: Date;
}

export interface Payment {
  id: number;
  transaction_id: number;
  amount: number;
  payment_date: Date;
  created_at: Date;
}

export interface PersonBalance {
  person_name: string;
  balance: number; // Positivt = de är skyldiga mig, Negativt = jag är skyldig dem
  transaction_count: number;
}

// Skapa tabeller (kör detta en gång när du sätter upp databasen)
export async function createTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      person_name VARCHAR(255) NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      type VARCHAR(20) NOT NULL CHECK (type IN ('lent_out', 'borrowed')),
      description TEXT,
      transaction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      due_date TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
      amount DECIMAL(10, 2) NOT NULL,
      payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_transactions_person_name ON transactions(user_id, person_name);
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
  `;
}

// Hämta alla transaktioner för en användare
export async function getTransactions(userId: string) {
  const { rows } = await sql<Transaction>`
    SELECT * FROM transactions
    WHERE user_id = ${userId}
    ORDER BY transaction_date DESC
  `;
  return rows;
}

// Hämta transaktioner för en specifik person
export async function getTransactionsByPerson(userId: string, personName: string) {
  const { rows } = await sql<Transaction>`
    SELECT * FROM transactions
    WHERE user_id = ${userId} AND person_name = ${personName}
    ORDER BY transaction_date DESC
  `;
  return rows;
}

// Hämta betalningar för en transaktion
export async function getPaymentsByTransaction(transactionId: number) {
  const { rows } = await sql<Payment>`
    SELECT * FROM payments
    WHERE transaction_id = ${transactionId}
    ORDER BY payment_date DESC
  `;
  return rows;
}

// Skapa ny transaktion
export async function createTransaction(
  userId: string,
  personName: string,
  amount: number,
  type: 'lent_out' | 'borrowed',
  description?: string,
  transactionDate?: Date,
  dueDate?: Date
) {
  const { rows } = await sql<Transaction>`
    INSERT INTO transactions (user_id, person_name, amount, type, description, transaction_date, due_date)
    VALUES (${userId}, ${personName}, ${amount}, ${type}, ${description || null}, ${(transactionDate || new Date()).toISOString()}, ${dueDate ? dueDate.toISOString() : null})
    RETURNING *
  `;
  return rows[0];
}

// Skapa ny betalning
export async function createPayment(
  transactionId: number,
  amount: number,
  paymentDate?: Date
) {
  const { rows } = await sql<Payment>`
    INSERT INTO payments (transaction_id, amount, payment_date)
    VALUES (${transactionId}, ${amount}, ${paymentDate || new Date()})
    RETURNING *
  `;
  return rows[0];
}

// Hämta balans per person
export async function getPersonBalances(userId: string): Promise<PersonBalance[]> {
  const { rows } = await sql<PersonBalance>`
    SELECT
      t.person_name,
      SUM(
        CASE
          WHEN t.type = 'lent_out' THEN t.amount
          WHEN t.type = 'borrowed' THEN -t.amount
        END
      ) - COALESCE(SUM(
        CASE
          WHEN t.type = 'lent_out' THEN p.amount
          WHEN t.type = 'borrowed' THEN -p.amount
          ELSE 0
        END
      ), 0) as balance,
      COUNT(DISTINCT t.id) as transaction_count
    FROM transactions t
    LEFT JOIN payments p ON p.transaction_id = t.id
    WHERE t.user_id = ${userId}
    GROUP BY t.person_name
    HAVING SUM(
      CASE
        WHEN t.type = 'lent_out' THEN t.amount
        WHEN t.type = 'borrowed' THEN -t.amount
      END
    ) - COALESCE(SUM(
      CASE
        WHEN t.type = 'lent_out' THEN p.amount
        WHEN t.type = 'borrowed' THEN -p.amount
        ELSE 0
      END
    ), 0) != 0
    ORDER BY balance DESC
  `;
  return rows;
}

// Hämta total balans för användaren
export async function getTotalBalance(userId: string): Promise<number> {
  const { rows } = await sql<{ total: number }>`
    SELECT
      COALESCE(SUM(
        CASE
          WHEN type = 'lent_out' THEN amount
          WHEN type = 'borrowed' THEN -amount
        END
      ), 0) as total
    FROM transactions
    WHERE user_id = ${userId}
  `;

  // Subtrahera alla betalningar
  const { rows: paymentRows } = await sql<{ total: number }>`
    SELECT COALESCE(SUM(p.amount), 0) as total
    FROM payments p
    JOIN transactions t ON p.transaction_id = t.id
    WHERE t.user_id = ${userId} AND t.type = 'lent_out'
  `;

  const { rows: paymentRows2 } = await sql<{ total: number }>`
    SELECT COALESCE(SUM(p.amount), 0) as total
    FROM payments p
    JOIN transactions t ON p.transaction_id = t.id
    WHERE t.user_id = ${userId} AND t.type = 'borrowed'
  `;

  return rows[0].total - (paymentRows[0].total - paymentRows2[0].total);
}

// Ta bort transaktion
export async function deleteTransaction(transactionId: number, userId: string) {
  await sql`
    DELETE FROM transactions
    WHERE id = ${transactionId} AND user_id = ${userId}
  `;
}
