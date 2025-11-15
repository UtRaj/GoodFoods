# backend/app/main.py

from .dependencies import get_db
from .init_db import init_database
from sqlalchemy.orm import Session
from datetime import date, timedelta
from . import activity, schemas, models
from typing import List, Optional, Dict
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from .auth import get_current_user, get_api_key_or_current_user, create_access_token



@asynccontextmanager
async def lifespan(app: FastAPI):
    init_database()
    yield

app = FastAPI(
    title="GoodFoods API",
    description="API for restaurant management system",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Authentication endpoints
@app.post("/register", response_model=schemas.User)
async def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):

    db_user = activity.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return activity.create_user(db=db, user=user)

@app.post("/login", response_model=schemas.Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):

    user = activity.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.user_id},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# User endpoints
@app.get("/users/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(get_current_user)):

    return current_user

@app.get("/users/{user_id}", response_model=schemas.User)
async def read_user(user_id: int, db: Session = Depends(get_db),auth: str = Depends(get_api_key_or_current_user)):

    if isinstance(auth, models.User):
        raise HTTPException(status_code=403, detail="API key required for this operation")

    db_user = activity.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.get("/users/{user_id}/reservations", response_model=List[schemas.Reservation])
async def read_user_reservations(user_id: int, db: Session = Depends(get_db),auth: str = Depends(get_api_key_or_current_user)):

    if isinstance(auth, models.User):
        raise HTTPException(status_code=403, detail="API key required for this operation")

    db_user = activity.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return activity.get_user_reservations(db, user_id=user_id)

@app.put("/users/me", response_model=schemas.User)
async def update_user_me(
    user_update: schemas.UserUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    return activity.update_user(db, current_user.user_id, user_update)

# Restaurant endpoints (API key required)
@app.post("/restaurants/", response_model=schemas.Restaurant)
async def create_restaurant(
    restaurant: schemas.RestaurantCreate,
    db: Session = Depends(get_db),
    auth: str = Depends(get_api_key_or_current_user)
):

    if isinstance(auth, models.User):
        raise HTTPException(status_code=403, detail="API key required for this operation")
    return activity.create_restaurant(db=db, restaurant=restaurant)

@app.get("/restaurants/", response_model=List[schemas.Restaurant])
async def list_restaurants(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):

    restaurants = activity.get_restaurants(db, skip=skip, limit=limit)
    if not restaurants:
        raise HTTPException(status_code=404, detail="No restaurants found")
    return restaurants

@app.get("/restaurants/{restaurant_id}", response_model=schemas.Restaurant)
async def get_restaurant_detail(
    restaurant_id: int,
    db: Session = Depends(get_db)
):

    restaurant = activity.get_restaurant(db, restaurant_id=restaurant_id)
    if restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant

@app.get("/restaurants/{restaurant_id}/availability", response_model=Dict[str, int])
async def get_restaurant_availability(
    restaurant_id: int,
    date: date,
    db: Session = Depends(get_db)
):

    restaurant = activity.get_restaurant(db, restaurant_id=restaurant_id)
    if restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    availability = activity.get_restaurant_availability(db, restaurant_id, date)
    return availability

@app.put("/restaurants/{restaurant_id}", response_model=schemas.Restaurant)
async def update_restaurant(
    restaurant_id: int,
    restaurant: schemas.RestaurantCreate,
    db: Session = Depends(get_db),
    auth: str = Depends(get_api_key_or_current_user)
):

    if isinstance(auth, models.User):
        raise HTTPException(status_code=403, detail="API key required for this operation")
    
    updated_restaurant = activity.update_restaurant(db, restaurant_id, restaurant)
    if updated_restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return updated_restaurant

@app.delete("/restaurants/{restaurant_id}")
async def delete_restaurant(
    restaurant_id: int,
    db: Session = Depends(get_db),
    auth: str = Depends(get_api_key_or_current_user)
):

    if isinstance(auth, models.User):
        raise HTTPException(status_code=403, detail="API key required for this operation")
    
    success = activity.delete_restaurant(db, restaurant_id)
    if not success:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return {"message": "Restaurant deleted successfully"}

# Reservation endpoints
@app.post("/reservations/", response_model=schemas.Reservation)
async def create_reservation(
    reservation: schemas.ReservationCreate,
    auth: models.User = Depends(get_api_key_or_current_user),
    db: Session = Depends(get_db)
):

    if isinstance(auth,models.User):
        current_user_id = auth.user_id
    else:
        if reservation.user_id is None:
            raise HTTPException(status_code=400, detail="User ID is required")
        current_user_id = reservation.user_id
    result = activity.create_reservation(db=db, reservation=reservation, user_id=current_user_id)
    if not result:
        raise HTTPException(status_code=400, detail="No tables available at the requested time")
    return result

@app.post("/book-restaurant/", response_model=schemas.ReservationResponse)
async def book_restaurant_by_name(
    reservation: schemas.SimpleReservationCreate,
    auth: models.User = Depends(get_api_key_or_current_user),
    db: Session = Depends(get_db)
):

    if isinstance(auth,models.User):
        current_user_id = auth.user_id
    else:
        if reservation.user_id is None:
            raise HTTPException(status_code=400, detail="User ID is required")
        current_user_id = reservation.user_id
    result = activity.create_reservation_by_restaurant_name(db=db, reservation=reservation, user_id=current_user_id)
    if not result:
        raise HTTPException(status_code=404, detail="No tables available at the requested time.")
    
    db_reservation, restaurant = result
    
    return schemas.ReservationResponse(
        reservation_id=db_reservation.reservation_id,
        restaurant_name=restaurant.restaurant_name,
        reservation_code=db_reservation.reservation_code,
        date=reservation.date,
        time=reservation.time,
        guests=reservation.guests,
        status=db_reservation.status.value
    )

@app.get("/my-reservations/", response_model=List[schemas.ReservationWithRestaurant])
async def get_my_reservations(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    return activity.get_user_reservations(db, user_id=current_user.user_id)

@app.put("/my-reservations/{reservation_id}", response_model=schemas.Reservation)
async def update_my_reservation(
    reservation_id: int,
    reservation_update: schemas.ReservationUpdate,
    auth: models.User = Depends(get_api_key_or_current_user),
    db: Session = Depends(get_db)
):

    if isinstance(auth,models.User):
        current_user_id = auth.user_id
    else:
        if reservation_update.user_id is None:
            raise HTTPException(status_code=400, detail="User ID is required")
        current_user_id = reservation_update.user_id
    updated_reservation = activity.update_reservation(
        db, reservation_id, reservation_update, current_user_id
    )
    if updated_reservation is None:
        raise HTTPException(status_code=404, detail="Reservation not found, not owned by you, or requested time is not available")
    return updated_reservation

@app.delete("/my-reservations/{reservation_id}", response_model=schemas.Reservation)
async def cancel_my_reservation(
    reservation_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    cancelled_reservation = activity.cancel_reservation(db, reservation_id, current_user.user_id)
    if cancelled_reservation is None:
        raise HTTPException(status_code=404, detail="Reservation not found or not owned by you")
    return cancelled_reservation

# Admin reservation endpoints (API key required)
@app.get("/reservations/", response_model=List[schemas.Reservation])
async def get_all_reservations(
    db: Session = Depends(get_db),
    auth: str = Depends(get_api_key_or_current_user)
):

    if isinstance(auth, models.User):
        raise HTTPException(status_code=403, detail="API key required for this operation")
    
    return db.query(models.Reservation).all()

@app.get("/restaurants/{restaurant_id}/reservations/", response_model=List[schemas.Reservation])
async def get_restaurant_reservations(
    restaurant_id: int,
    reservation_date: Optional[date] = None,
    db: Session = Depends(get_db),
    auth: str = Depends(get_api_key_or_current_user)
):

    if isinstance(auth, models.User):
        raise HTTPException(status_code=403, detail="API key required for this operation")
    
    return activity.get_restaurant_reservations(db, restaurant_id, reservation_date)