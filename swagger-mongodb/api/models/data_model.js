var util = require('./data_model_utils');

module.exports = function (mongoose) {
    var Moment = mongoose.Schema({
        created: { type: Date, required: true },
        authorName: { type: String, validate: util.strLength(64), required: true },
        modified: { type: Date, required: true },
        text: { type: String, validate: util.strLength(300), required: true },
        commentCount: Number
    });
    Moment.pre('validate', true, util.initMomentCounters);
    Moment.pre('validate', true, util.updateTimeStamps);

    var Comment = mongoose.Schema({
        authorName: { type: String, validate: util.strLength(64), required: true },
        parent: { type: String },
        parentMoment: { type: String, required: true },
        text: { type: String, validate: util.strLength(300), required: true },
        created: { type: Date, required: true },
        modified: { type: Date, required: true }
    });
    Comment.pre('validate', true, util.updateTimeStamps);

    return {
        Moment: mongoose.model("moment", Moment),
        Comment: mongoose.model("comment", Comment)
    };
};