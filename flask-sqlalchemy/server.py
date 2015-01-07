from flask import Flask, g, jsonify, request
from flask_jsontools import DynamicJSONEncoder, make_json_response
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from data_model import Moment
from bson.json_util import dumps

__author__ = 'niels'

# Instantiate application
app = Flask(__name__)
app.config.from_object(__name__)
app.json_encoder = DynamicJSONEncoder
app.debug = True

# Initiate ORM
engine = create_engine("sqlite:///memory:", echo=True)
Session = sessionmaker(bind=engine)

@app.before_request
def before_request():
    # Open DB connection
    g.db_session = Session()

# Create - Moment
@app.route("/moment", methods=["POST"])
def post_moment():
    moment = Moment(request.json)
    g.db_session.add(moment)
    g.db_session.commit()
    return make_json_response(moment)

# Read - Moment (plural)
@app.route("/moment", methods=["GET"])
def get_moments():
    result = g.db_session.query(Moment)\
        .all()
    return make_json_response(result)

# Read - Moment
@app.route("/moment/<int:id>", methods=["GET"])
def get_moment_by_id(id):
    result = g.db_session.query(Moment)\
        .filter(Moment.id == id)\
        .one()
    return make_json_response(result)

# Update - Moment
@app.route("/moment/<int:id>", methods=["PUT"])
def put_moment(id):
    result = g.db_session.query(Moment)\
        .filter(Moment.id == id)\
        .update(request.json)
    g.db_session.commit()
    return make_json_response(result)

# Delete - Moment
@app.route("/moment/<int:id>", methods=["DELETE"])
def delete_moment(id):
    moment = g.db_session.query(Moment)\
        .filter(Moment.id == id)\
        .one()
    g.db_session.delete(moment)
    g.db_session.commit()
    return make_json_response(moment)

if __name__ == '__main__':
    app.run()