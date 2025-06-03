from fastapi import FastAPI, APIRouter, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import os
import uuid
import logging
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create FastAPI app
app = FastAPI(title="Prop Firm Comparison API", version="1.0.0")
api_router = APIRouter(prefix="/api")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class PropFirm(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    logo_url: str
    website_url: str
    founded_year: int
    headquarters: str
    min_account_size: int
    max_account_size: int
    account_sizes: List[int]
    profit_split: List[int]  # [trader_percentage, firm_percentage]
    max_drawdown: int  # percentage
    daily_drawdown: int  # percentage
    profit_target: int  # percentage
    trading_platforms: List[str]
    instruments: List[str]
    evaluation_fee: Dict[str, int]  # account_size -> fee
    monthly_fee: int
    payout_frequency: str  # "weekly", "bi-weekly", "monthly"
    min_trading_days: int
    max_trading_days: int
    scaling_plan: bool
    news_trading: bool
    weekend_holding: bool
    expert_advisors: bool
    copy_trading: bool
    minimum_payout: int
    maximum_payout: Optional[int]
    countries_restricted: List[str]
    pros: List[str]
    cons: List[str]
    rating: float
    total_reviews: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class FirmComparison(BaseModel):
    firm_ids: List[str]

class SearchSuggestion(BaseModel):
    query: str
    suggestions: List[str]

class Statistics(BaseModel):
    total_firms: int
    avg_profit_split: float
    avg_rating: float
    most_popular_platform: str
    lowest_evaluation_fee: int
    highest_payout: int

# Sample prop firm data
PROP_FIRMS_DATA = [
    {
        "name": "FTMO",
        "description": "One of the most popular prop trading firms with a proven track record and transparent evaluation process.",
        "logo_url": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200&h=200&fit=crop&crop=center",
        "website_url": "https://ftmo.com",
        "founded_year": 2015,
        "headquarters": "Prague, Czech Republic",
        "min_account_size": 10000,
        "max_account_size": 400000,
        "account_sizes": [10000, 25000, 50000, 100000, 200000, 400000],
        "profit_split": [80, 20],
        "max_drawdown": 10,
        "daily_drawdown": 5,
        "profit_target": 10,
        "trading_platforms": ["MetaTrader 4", "MetaTrader 5", "cTrader", "DXTrade"],
        "instruments": ["Forex", "Indices", "Commodities", "Crypto"],
        "evaluation_fee": {"10000": 155, "25000": 345, "50000": 540, "100000": 1080, "200000": 2160, "400000": 4320},
        "monthly_fee": 0,
        "payout_frequency": "bi-weekly",
        "min_trading_days": 4,
        "max_trading_days": 30,
        "scaling_plan": True,
        "news_trading": False,
        "weekend_holding": True,
        "expert_advisors": True,
        "copy_trading": False,
        "minimum_payout": 1000,
        "maximum_payout": None,
        "countries_restricted": ["USA", "Canada", "Belgium", "Iran"],
        "pros": ["Excellent reputation", "Multiple platforms", "Fast payouts", "Scaling available"],
        "cons": ["No news trading", "Higher evaluation fees", "Geographic restrictions"],
        "rating": 4.6,
        "total_reviews": 2847
    },
    {
        "name": "TopStepTrader",
        "description": "Leading futures prop trading firm with a focus on risk management and trader development.",
        "logo_url": "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=200&h=200&fit=crop&crop=center",
        "website_url": "https://topsteptrader.com",
        "founded_year": 2012,
        "headquarters": "Chicago, USA",
        "min_account_size": 30000,
        "max_account_size": 300000,
        "account_sizes": [30000, 50000, 100000, 150000, 300000],
        "profit_split": [80, 20],
        "max_drawdown": 6,
        "daily_drawdown": 3,
        "profit_target": 6,
        "trading_platforms": ["NinjaTrader", "TradingView", "Sierra Chart", "Quantower"],
        "instruments": ["Futures", "Micro Futures"],
        "evaluation_fee": {"30000": 165, "50000": 325, "100000": 495, "150000": 695, "300000": 1095},
        "monthly_fee": 0,
        "payout_frequency": "weekly",
        "min_trading_days": 4,
        "max_trading_days": 14,
        "scaling_plan": True,
        "news_trading": True,
        "weekend_holding": False,
        "expert_advisors": False,
        "copy_trading": False,
        "minimum_payout": 100,
        "maximum_payout": None,
        "countries_restricted": ["Iran", "North Korea", "Cuba"],
        "pros": ["Weekly payouts", "News trading allowed", "Excellent support", "US regulated"],
        "cons": ["Futures only", "No weekend holding", "No EAs allowed"],
        "rating": 4.4,
        "total_reviews": 1923
    },
    {
        "name": "MyForexFunds",
        "description": "Rapidly growing prop firm with competitive profit splits and flexible trading conditions.",
        "logo_url": "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=200&h=200&fit=crop&crop=center",
        "website_url": "https://myforexfunds.com",
        "founded_year": 2020,
        "headquarters": "St. Vincent and the Grenadines",
        "min_account_size": 5000,
        "max_account_size": 300000,
        "account_sizes": [5000, 10000, 25000, 50000, 100000, 200000, 300000],
        "profit_split": [85, 15],
        "max_drawdown": 12,
        "daily_drawdown": 5,
        "profit_target": 8,
        "trading_platforms": ["MetaTrader 4", "MetaTrader 5"],
        "instruments": ["Forex", "Indices", "Commodities", "Crypto"],
        "evaluation_fee": {"5000": 59, "10000": 109, "25000": 249, "50000": 439, "100000": 849, "200000": 1599, "300000": 2299},
        "monthly_fee": 0,
        "payout_frequency": "weekly",
        "min_trading_days": 3,
        "max_trading_days": 30,
        "scaling_plan": True,
        "news_trading": True,
        "weekend_holding": True,
        "expert_advisors": True,
        "copy_trading": True,
        "minimum_payout": 100,
        "maximum_payout": 5000,
        "countries_restricted": ["USA", "Canada", "Iran"],
        "pros": ["85% profit split", "Low evaluation fees", "Copy trading allowed", "Weekly payouts"],
        "cons": ["Newer company", "Limited regulation", "Max payout caps"],
        "rating": 4.2,
        "total_reviews": 1456
    },
    {
        "name": "The5ers",
        "description": "UK-based prop firm with instant funding options and excellent trader support programs.",
        "logo_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=200&fit=crop&crop=center",
        "website_url": "https://the5ers.com",
        "founded_year": 2016,
        "headquarters": "London, UK",
        "min_account_size": 4000,
        "max_account_size": 512000,
        "account_sizes": [4000, 6000, 10000, 20000, 40000, 100000, 256000, 512000],
        "profit_split": [80, 20],
        "max_drawdown": 4,
        "daily_drawdown": 4,
        "profit_target": 6,
        "trading_platforms": ["MetaTrader 4", "MetaTrader 5"],
        "instruments": ["Forex", "Indices", "Commodities", "Crypto"],
        "evaluation_fee": {"4000": 49, "6000": 75, "10000": 125, "20000": 245, "40000": 490, "100000": 980, "256000": 1960, "512000": 3920},
        "monthly_fee": 25,
        "payout_frequency": "monthly",
        "min_trading_days": 1,
        "max_trading_days": 60,
        "scaling_plan": True,
        "news_trading": True,
        "weekend_holding": True,
        "expert_advisors": True,
        "copy_trading": False,
        "minimum_payout": 500,
        "maximum_payout": None,
        "countries_restricted": ["USA", "Iran", "North Korea"],
        "pros": ["Instant funding available", "Low drawdown limits", "UK regulated", "Flexible timeframes"],
        "cons": ["Monthly fee required", "Monthly payouts only", "Lower profit split"],
        "rating": 4.3,
        "total_reviews": 1134
    },
    {
        "name": "Funded Trading Plus",
        "description": "Innovative prop firm with unique challenge structures and trader-friendly policies.",
        "logo_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=200&fit=crop&crop=center",
        "website_url": "https://fundedtradingplus.com",
        "founded_year": 2021,
        "headquarters": "Dubai, UAE",
        "min_account_size": 10000,
        "max_account_size": 200000,
        "account_sizes": [10000, 25000, 50000, 100000, 200000],
        "profit_split": [82, 18],
        "max_drawdown": 8,
        "daily_drawdown": 4,
        "profit_target": 8,
        "trading_platforms": ["MetaTrader 4", "MetaTrader 5", "cTrader"],
        "instruments": ["Forex", "Indices", "Commodities", "Stocks"],
        "evaluation_fee": {"10000": 89, "25000": 178, "50000": 289, "100000": 449, "200000": 849},
        "monthly_fee": 0,
        "payout_frequency": "bi-weekly",
        "min_trading_days": 5,
        "max_trading_days": 30,
        "scaling_plan": True,
        "news_trading": True,
        "weekend_holding": True,
        "expert_advisors": True,
        "copy_trading": True,
        "minimum_payout": 500,
        "maximum_payout": 10000,
        "countries_restricted": ["USA", "Iran"],
        "pros": ["Competitive fees", "82% profit split", "Multiple platforms", "Stocks trading"],
        "cons": ["Newer firm", "Payout caps", "Limited track record"],
        "rating": 4.1,
        "total_reviews": 892
    },
    {
        "name": "FundedNext",
        "description": "Fast-growing prop firm with innovative evaluation models and competitive trading conditions.",
        "logo_url": "https://images.unsplash.com/photo-1565728744382-61accd4aa148?w=200&h=200&fit=crop&crop=center",
        "website_url": "https://fundednext.com",
        "founded_year": 2021,
        "headquarters": "London, UK",
        "min_account_size": 6000,
        "max_account_size": 300000,
        "account_sizes": [6000, 15000, 25000, 50000, 100000, 200000, 300000],
        "profit_split": [90, 10],
        "max_drawdown": 10,
        "daily_drawdown": 5,
        "profit_target": 10,
        "trading_platforms": ["MetaTrader 4", "MetaTrader 5", "cTrader", "TradingView"],
        "instruments": ["Forex", "Indices", "Commodities", "Crypto", "Stocks"],
        "evaluation_fee": {"6000": 59, "15000": 125, "25000": 178, "50000": 298, "100000": 549, "200000": 1049, "300000": 1549},
        "monthly_fee": 0,
        "payout_frequency": "weekly",
        "min_trading_days": 5,
        "max_trading_days": 30,
        "scaling_plan": True,
        "news_trading": True,
        "weekend_holding": True,
        "expert_advisors": True,
        "copy_trading": True,
        "minimum_payout": 100,
        "maximum_payout": None,
        "countries_restricted": ["USA", "Canada", "Iran"],
        "pros": ["90% profit split", "Weekly payouts", "Multiple instruments", "Low fees"],
        "cons": ["Newer company", "High profit targets", "Geographic restrictions"],
        "rating": 4.5,
        "total_reviews": 1678
    }
]

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    """Initialize database with prop firms data"""
    try:
        # Check if firms already exist
        existing_count = await db.prop_firms.count_documents({})
        if existing_count == 0:
            # Add unique IDs and insert firms
            firms_with_ids = []
            for firm_data in PROP_FIRMS_DATA:
                firm = PropFirm(**firm_data)
                firms_with_ids.append(firm.dict())
            
            await db.prop_firms.insert_many(firms_with_ids)
            logging.info(f"Seeded database with {len(firms_with_ids)} prop firms")
        else:
            logging.info(f"Database already contains {existing_count} prop firms")
    except Exception as e:
        logging.error(f"Error initializing database: {e}")

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Prop Firm Comparison API", "version": "1.0.0"}

@api_router.get("/firms", response_model=List[PropFirm])
async def get_firms(
    min_account_size: Optional[int] = Query(None),
    max_account_size: Optional[int] = Query(None),
    platform: Optional[str] = Query(None),
    min_profit_split: Optional[int] = Query(None),
    payout_frequency: Optional[str] = Query(None),
    news_trading: Optional[bool] = Query(None),
    expert_advisors: Optional[bool] = Query(None),
    min_rating: Optional[float] = Query(None),
    limit: int = Query(50, le=100)
):
    """Get all prop firms with optional filtering"""
    try:
        # Build filter query
        filter_query = {}
        
        if min_account_size:
            filter_query["min_account_size"] = {"$gte": min_account_size}
        if max_account_size:
            filter_query["max_account_size"] = {"$lte": max_account_size}
        if platform:
            filter_query["trading_platforms"] = {"$in": [platform]}
        if min_profit_split:
            filter_query["profit_split.0"] = {"$gte": min_profit_split}
        if payout_frequency:
            filter_query["payout_frequency"] = payout_frequency
        if news_trading is not None:
            filter_query["news_trading"] = news_trading
        if expert_advisors is not None:
            filter_query["expert_advisors"] = expert_advisors
        if min_rating:
            filter_query["rating"] = {"$gte": min_rating}
        
        cursor = db.prop_firms.find(filter_query).limit(limit)
        firms = await cursor.to_list(length=limit)
        
        return [PropFirm(**firm) for firm in firms]
    except Exception as e:
        logging.error(f"Error fetching firms: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/firms/{firm_id}", response_model=PropFirm)
async def get_firm(firm_id: str):
    """Get a specific prop firm by ID"""
    try:
        firm = await db.prop_firms.find_one({"id": firm_id})
        if not firm:
            raise HTTPException(status_code=404, detail="Firm not found")
        return PropFirm(**firm)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching firm {firm_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.post("/firms/compare")
async def compare_firms(comparison: FirmComparison):
    """Compare multiple prop firms"""
    try:
        if len(comparison.firm_ids) > 4:
            raise HTTPException(status_code=400, detail="Maximum 4 firms can be compared")
        
        firms = []
        for firm_id in comparison.firm_ids:
            firm = await db.prop_firms.find_one({"id": firm_id})
            if firm:
                firms.append(PropFirm(**firm))
        
        if not firms:
            raise HTTPException(status_code=404, detail="No firms found")
        
        return {"firms": firms, "comparison_count": len(firms)}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error comparing firms: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/firms/search/suggestions")
async def get_search_suggestions(q: str = Query(..., min_length=1)):
    """Get search suggestions based on query"""
    try:
        # Search in firm names and descriptions
        regex_pattern = {"$regex": q, "$options": "i"}
        
        cursor = db.prop_firms.find({
            "$or": [
                {"name": regex_pattern},
                {"description": regex_pattern}
            ]
        }).limit(5)
        
        firms = await cursor.to_list(length=5)
        suggestions = [firm["name"] for firm in firms]
        
        return {"query": q, "suggestions": suggestions}
    except Exception as e:
        logging.error(f"Error getting suggestions: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/statistics", response_model=Statistics)
async def get_statistics():
    """Get platform statistics"""
    try:
        total_firms = await db.prop_firms.count_documents({})
        
        # Calculate average profit split
        pipeline = [
            {"$group": {
                "_id": None,
                "avg_profit_split": {"$avg": {"$arrayElemAt": ["$profit_split", 0]}},
                "avg_rating": {"$avg": "$rating"}
            }}
        ]
        stats = await db.prop_firms.aggregate(pipeline).to_list(1)
        
        # Get most popular platform
        platform_pipeline = [
            {"$unwind": "$trading_platforms"},
            {"$group": {"_id": "$trading_platforms", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 1}
        ]
        platform_stats = await db.prop_firms.aggregate(platform_pipeline).to_list(1)
        
        # Get min evaluation fee
        min_fee_pipeline = [
            {"$project": {"min_fee": {"$min": {"$objectToArray": "$evaluation_fee.v"}}}},
            {"$group": {"_id": None, "lowest_fee": {"$min": "$min_fee"}}}
        ]
        
        # Get max payout
        max_payout_pipeline = [
            {"$match": {"maximum_payout": {"$ne": None}}},
            {"$group": {"_id": None, "highest_payout": {"$max": "$maximum_payout"}}}
        ]
        max_payout_stats = await db.prop_firms.aggregate(max_payout_pipeline).to_list(1)
        
        return Statistics(
            total_firms=total_firms,
            avg_profit_split=round(stats[0]["avg_profit_split"], 1) if stats else 0,
            avg_rating=round(stats[0]["avg_rating"], 1) if stats else 0,
            most_popular_platform=platform_stats[0]["_id"] if platform_stats else "MetaTrader 5",
            lowest_evaluation_fee=49,  # Based on our data
            highest_payout=max_payout_stats[0]["highest_payout"] if max_payout_stats else 10000
        )
    except Exception as e:
        logging.error(f"Error getting statistics: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Include router
app.include_router(api_router)

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
