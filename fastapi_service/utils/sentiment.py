from transformers import pipeline
import re

EMOTION_MAP = {
    5: "happy",
    4: "satisfied",
    3: "neutral", 
    2: "disappointed",
    1: "frustrated"
}

def analyze_comment(comment: str) -> dict:
    """Analyze sentiment of French comment using multilingual BERT."""
    try:
        classifier = pipeline(
            "sentiment-analysis",
            model="nlptown/bert-base-multilingual-uncased-sentiment",
            return_all_scores=True
        )
        result = classifier(comment)[0]
        
        # Get highest score label and map to emotion
        top_label = max(result, key=lambda x: x['score'])['label']
        stars = int(re.search(r'\d+', top_label).group())
        emotion = EMOTION_MAP.get(stars, "neutral")
        
        confidence = max(result, key=lambda x: x['score'])['score']
        
        return {
            "emotion": emotion,
            "confidence": round(confidence, 3),
            "stars": stars,
            "raw_scores": {r['label']: round(r['score'], 3) for r in result}
        }
    except Exception as e:
        # Fallback keyword-based for French
        comment_lower = comment.lower()
        positive_words = ['excellent', 'super', 'parfait', 'adorable', 'genial', 'merveilleux', 'fantastique']
        negative_words = ['mauvais', 'nul', 'horrible', 'décevant', 'frustrant', 'déçu']
        
        pos_count = sum(1 for word in positive_words if word in comment_lower)
        neg_count = sum(1 for word in negative_words if word in comment_lower)
        
        if pos_count > neg_count:
            emotion = "happy"
        elif neg_count > pos_count:
            emotion = "frustrated"
        else:
            emotion = "neutral"
        
        return {
            "emotion": emotion,
            "confidence": 0.6,
            "stars": 3,
            "method": "fallback_keywords"
        }

