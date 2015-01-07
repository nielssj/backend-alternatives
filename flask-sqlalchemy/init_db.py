from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from data_model import Consumer, Base, Moment

__author__ = 'niels'

engine = create_engine("sqlite:///memory:", echo=True)
Session = sessionmaker(bind=engine)

# Creating tables based on schema(s)
Base.metadata.create_all(engine)

# Starting a session
session = Session()

# Adding some data
niels = Consumer(username="nielssj", name="Niels Jensen", email="nm@9la.dk")
session.add(niels)
session.commit()

# Adding multiple users
session.add_all([
    Consumer(username="ctverecek", name="Pavel Prochazka", email="ppprochazka72@gmail.com"),
    Consumer(username="arnaudkevin", name="Arnaud Kevin", email="arnaudkevein@github.com")
])
session.add_all([
    Moment(author=2, text="I cooked a delicious lasagna from this amazing recipe! You should do the same, dude.", subjectId=389),
    Moment(author=3, text="Heinz is truly the only real Ketchup brand I would consider. Now they are on Nourriture, check it out!", subjectId=271)
])
session.commit()

# Querying
for consumer in session.query(Consumer):
    print consumer.username

query = session\
    .query(Consumer)\
    .with_entities(Consumer.name)\
    .filter(Consumer.username == "nielssj")
for consumer in query:
    print consumer.name

# Dropping all tables
#Base.metadata.drop_all(engine)