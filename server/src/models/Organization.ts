
import mongoose, { Schema } from 'mongoose'

const organizationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    defaultLowStockThreshold: {
      type: Number,
      required: true,
      default: 5,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
)

const Organization =
  mongoose.models.Organization ||
  mongoose.model('Organization', organizationSchema)

export default Organization
