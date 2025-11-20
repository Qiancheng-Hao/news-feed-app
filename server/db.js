const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// 1. Initialize connection
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    timezone: '+08:00',
});

// 2. Users Model
const User = sequelize.define(
    'User',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: { isEmail: true },
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

// Posts Model
const Post = sequelize.define(
    'Post',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        images: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        tags: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('published', 'draft'),
            defaultValue: 'published',
        },
    },
    {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        tableName: 'posts',
    }
);

// 一个用户可以发多篇帖子
User.hasMany(Post, { foreignKey: 'user_id' });
// 一篇帖子属于一个用户
Post.belongsTo(User, { foreignKey: 'user_id' });

// 3. Initialize DB
const initDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ 数据库连接成功');

        // create users table if not exists or update it
        await sequelize.sync({ alter: true });
        console.log('✅ 所有表模型已同步！');

        // await sequelize.sync({ force: true });
        // console.log('✅ 数据库已重置');
    } catch (error) {
        console.error('❌ 连接失败:', error);
    }
};

module.exports = { sequelize, User, Post, initDB };
