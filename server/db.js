const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Initialize connection
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    timezone: '+08:00',
});

// Users Model
const User = sequelize.define(
    'User',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
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
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
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
        topics: {
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
        indexes: [
            {
                fields: ['status', 'created_at'],
            },
        ],
    }
);

// 一个用户可以发多篇帖子，一篇帖子属于一个用户
User.hasMany(Post, { foreignKey: 'user_id' });
Post.belongsTo(User, { foreignKey: 'user_id' });

// Initialize DB
const initDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ 数据库连接成功');

        // create users table if not exists or update it
        // await sequelize.sync({ alter: true });
        await sequelize.sync();
        console.log('✅ 所有表模型已同步！');

        // Try to add Multi-Valued Index for JSON tags
        try {
            await sequelize.query(
                'ALTER TABLE posts ADD INDEX idx_tags ( (CAST(tags AS CHAR(255) ARRAY)) );'
            );
            console.log('✅ JSON索引 (idx_tags) 创建成功');
        } catch (err) {
            // Ignore error if index already exists (Error 1061)
            if (err.original && err.original.errno === 1061) {
                console.log('ℹ️ JSON索引 (idx_tags) 已存在');
            } else {
                // Don't spam console if it's just a version issue or other non-critical error
                // console.warn('⚠️ 无法创建JSON索引 (可能是MySQL版本低于8.0):', err.message);
            }
        }

        // await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
        // await User.sync({ force: true });
        // await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
        // await Post.sync();

        // await sequelize.sync({ force: true });
        // console.log('✅ User数据库已重置');
    } catch (error) {
        console.error('❌ 连接失败:', error);
    }
};

module.exports = { sequelize, User, Post, initDB };
