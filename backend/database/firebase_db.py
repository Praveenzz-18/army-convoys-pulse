import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv
import os

load_dotenv()

# Build path to firebase_key.json in the parent directory (backend/)
cred_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "firebase_key.json")

if not firebase_admin._apps:
    try:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        print("Firebase Firestore initialized successfully.")
    except Exception as e:
        print(f"Failed to initialize Firebase: {e}")

# Initialize Firestore Client
db = firestore.client()

class ConvoyDB:
    def __init__(self):
        self.collection = db.collection('convoys')
    
    def create(self, data):
        # Using Python datetime for consistency
        from datetime import datetime
        data['created_at'] = datetime.utcnow().isoformat()
        data['status'] = 'planned'
        
        # Check if ID is provided in data
        custom_id = data.pop('id', None)
        
        if custom_id:
            self.collection.document(custom_id).set(data)
            return custom_id
        else:
            # Firestore .add() returns (update_time, doc_ref)
            _, doc_ref = self.collection.add(data)
            return doc_ref.id
    
    def get_all(self, user_id=None):
        # stream() gets all documents
        if user_id:
            docs = self.collection.where('user_id', '==', user_id).stream()
        else:
            docs = self.collection.stream()
        return [{**doc.to_dict(), 'id': doc.id} for doc in docs]
    
    def get(self, convoy_id):
        doc = self.collection.document(convoy_id).get()
        if doc.exists:
            return doc.to_dict()
        return None
    
    def update(self, convoy_id, updates):
        self.collection.document(convoy_id).update(updates)
    
    def delete(self, convoy_id):
        self.collection.document(convoy_id).delete()

convoy_db = ConvoyDB()
