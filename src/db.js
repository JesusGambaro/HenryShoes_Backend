const { Sequelize } = require("sequelize")
const fs = require("fs")
const path = require("path")
require("dotenv").config()
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;
const URL = `postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?options=project%3D${ENDPOINT_ID}&ssl=true`;
const sequelize = new Sequelize(URL,
  {
    logging: false,
    native: false,
  }
)
const basename = path.basename(__filename)

const modelDefiners = []

fs.readdirSync(path.join(__dirname, "/models"))
  .filter(
    (file) =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
  )
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, "/models", file)))
  })

modelDefiners.forEach((model) => model(sequelize))

let entries = Object.entries(sequelize.models)
let capsEntries = entries.map((entry) => [
  entry[0][0].toUpperCase() + entry[0].slice(1),
  entry[1],
])
sequelize.models = Object.fromEntries(capsEntries)

const {
  Product,
  Image,
  Stock,
  Order,
  ShoppingCartItem,
  User,
  FavoriteItem,
  Payment,
  Review,
} = sequelize.models

Product.hasMany(Image)
Image.belongsTo(Product)
Product.hasMany(Stock)
Stock.belongsTo(Product)

User.hasMany(ShoppingCartItem)
ShoppingCartItem.belongsTo(User)
User.hasMany(Order)
Order.belongsTo(User)
Order.hasOne(Payment)
Payment.belongsTo(Order)

Product.hasMany(ShoppingCartItem)
ShoppingCartItem.belongsTo(Product)
Order.hasMany(ShoppingCartItem)
ShoppingCartItem.belongsTo(Order)

User.hasMany(FavoriteItem)
FavoriteItem.belongsTo(User)
Product.hasMany(FavoriteItem)
FavoriteItem.belongsTo(Product)

User.hasMany(Review)
Review.belongsTo(User)
Product.belongsToMany(Review, { through: "SameModelProductsReview" })
Review.belongsToMany(Product, { through: "SameModelProductsReview" })

module.exports = {
  ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
  conn: sequelize, // para importart la conexión { conn } = require('./db.js');
}
