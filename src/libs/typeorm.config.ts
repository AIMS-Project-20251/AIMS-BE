import { join } from 'path';
import { env } from 'src/config';
import { DataSource } from 'typeorm';

const dataSource = new DataSource({
  type: 'mysql',
  host: env.mysql.host,
  port: env.mysql.port,
  username: 'root',
  password: env.mysql.password,
  database: env.mysql.database,
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  synchronize: true,
});

export default dataSource;