const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// 1. Initialize connection
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'mysql',
  logging: false,
});

// 2. User Model
const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    avatar: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
  },
  {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    tableName: 'users',
  }
);

// 3. Initialize DB
const initDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ 恭喜！数据库连接成功！');

    // create users table if not exists or update it
    await sequelize.sync({ alter: true });
    console.log('✅ User 表已成功创建！');
  } catch (error) {
    console.error('❌ 连接失败，请检查 .env 文件:', error);
  }
};

// // 如果直接运行此文件，则初始化数据库
// if (require.main === module) {
//   initDB();
// }

module.exports = { sequelize, User, initDB };
