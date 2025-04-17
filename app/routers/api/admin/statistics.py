from fastapi import Depends, HTTPException, Query
from app.models.statistics import StatisticsModel
from app.dependencies import router, get_db_for_new_thread

# Các type được hỗ trợ
VALID_TYPES = {'date', 'month', 'year', 'week'}


@router.get('/api/admin/statistics/revenue')
async def revenue(
    type: str = Query(default='week'),
    startDate: str = '',
    endDate: str = '',
    limit: int = 7,
    offset: int = 0,
    db=Depends(get_db_for_new_thread)
):
    if type not in VALID_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid type: {type}")

    statistics_model = StatisticsModel(db)
    statistics = await statistics_model.revenue_data(
        type=type,
        startDate=startDate,
        endDate=endDate,
        limit=limit,
        offset=offset
    )
    return statistics


@router.get('/api/admin/statistics/order_count')
async def count_order(
    type: str = Query(default='week'),
    startDate: str = '',
    endDate: str = '',
    limit: int = 7,
    offset: int = 0,
    db=Depends(get_db_for_new_thread)
):
    if type not in VALID_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid type: {type}")

    statistics_model = StatisticsModel(db)
    statistics = await statistics_model.revenue_count_order(
        type=type,
        startDate=startDate,
        endDate=endDate,
        limit=limit,
        offset=offset
    )
    return statistics


@router.get('/api/admin/statistics/daily_revenue_and_order_count')
async def daily_revenue_and_order_count(db=Depends(get_db_for_new_thread)):
    statistics_model = StatisticsModel(db)
    statistics = await statistics_model.get_daily_revenue_and_order_count()
    return statistics
