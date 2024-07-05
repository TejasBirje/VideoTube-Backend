import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema(
  {
    content: {
        type: String,
        required: true,
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
  },
  {
    timestamps: true,
  }
);

commentSchema.plugin(mongooseAggregatePaginate)

//commentSchema.plugin(mongooseAggregatePaginate): This line adds the mongooseAggregatePaginate-v2 plugin to the commentSchema. This plugin extends the comment model with a new method called aggregatePaginate(), which enables you to perform pagination on aggregated comment data.
// What paginate Does:

//The aggregatePaginate() method, provided by the plugin, allows you to efficiently retrieve paginated results from your comment collection after performing aggregation pipelines. Aggregation pipelines are a powerful feature in Mongoose that let you manipulate and transform your data using various stages (like filtering, sorting, grouping, etc.) before retrieving it.


export const Comment = mongoose.model("Comment", commentSchema)