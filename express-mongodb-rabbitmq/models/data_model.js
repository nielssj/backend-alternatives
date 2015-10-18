var util = require('./data_model_utils');

module.exports = function (mongoose) {
    var Moment = mongoose.Schema({
        created: { type: Date, required: true },
        authorName: { type: String, validate: util.strLength(64), required: true },
        modified: { type: Date, required: true },
        text: { type: String, validate: util.strLength(400), required: true },
        /*comments: [Comment],*/ // FIXME: Define this
        commentCount: Number
    });
    Moment.pre('validate', true, util.initMomentCounters);
    Moment.pre('validate', true, util.updateTimeStamps);

    return {
        Moment: mongoose.model("moment", Moment)
    };
};