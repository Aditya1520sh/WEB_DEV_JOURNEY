import { DataTypes } from "sequelize";
import sequelize from "../sequelize.js";

const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  google_id: { type: DataTypes.STRING, unique: true },
  spotify_id: { type: DataTypes.STRING, unique: true },
  name: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING, unique: true },
  picture: { type: DataTypes.STRING },
  locale: { type: DataTypes.STRING },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  last_login: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'users',   // explicitly specify the table name
  timestamps: false,    // since you are using created_at and last_login manually
});

export default User;
