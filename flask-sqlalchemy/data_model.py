import datetime
from sqlalchemy import create_engine, Column, Integer, DateTime, String
from sqlalchemy.ext.declarative import declarative_base
from flask_jsontools import JsonSerializableBase, DynamicJSONEncoder

__author__ = 'niels'

engine = create_engine("sqlite:///memory:", echo=True)
Base = declarative_base(cls=(JsonSerializableBase,))

# Declaring a Schema
class Consumer(Base):
    __tablename__ = "consumers"
    id = Column(Integer, primary_key=True)
    created = Column(DateTime)
    modified = Column(DateTime)
    username = Column(String(128))
    email = Column(String(128))
    name = Column(String(64))
    picture =  Column(String(512))
    bio = Column(String(4096))
    occupation = Column(String(128))
    gender = Column(Integer)
    birthday = Column(DateTime)
    website = Column(String(512))
    followCount = Column(Integer)

class Moment(Base):
    __tablename__ = "moments"
    id = Column(Integer, primary_key=True)
    created = Column(DateTime)
    modified = Column(DateTime)
    author = Column(Integer)
    text =  Column(String(1024))
    subjectId = Column(Integer)
    likeCount = Column(Integer)
    commentCount = Column(Integer)

    def __init__(self, dictInst):
        for field in dictInst:
            setattr(self, field, dictInst[field])


class ApiJSONEncoder(DynamicJSONEncoder):
    def default(self, o):
        # Custom formats
        if isinstance(o, datetime.datetime):
            return o.isoformat(' ')
        if isinstance(o, datetime.date):
            return o.isoformat()
        # Fallback
        return super(DynamicJSONEncoder, self).default(o)