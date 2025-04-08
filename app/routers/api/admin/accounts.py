from fastapi import Depends, HTTPException, Request, Response
from app.models.account import AccountModel
from app.dependencies import router, get_db_for_new_thread


@router.get('/api/admin/accounts')
async def accounts(db=Depends(get_db_for_new_thread)):
    account_model = AccountModel(db)
    accounts = account_model.get_all_accounts()
    return accounts


@router.get('/api/admin/account/{username}')
async def get_account(username: str, db=Depends(get_db_for_new_thread)):
    account_model = AccountModel(db)
    account = account_model.get_account_by_username(username)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@router.put("/api/admin/account/{username}")
async def update_account(username: str, request: Request, db=Depends(get_db_for_new_thread)):
    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON format")

    if not data:
        raise HTTPException(status_code=400, detail="No data provided for update")

    if "status" in data:
        new_status = data["status"]
        if new_status not in ("active", "inactive"):
            raise HTTPException(status_code=400, detail="Invalid status value")

    account_model = AccountModel(db)

    if not account_model.get_account_by_username(username):
        raise HTTPException(status_code=404, detail="Account not found")

    success = account_model.update_account(username, data)

    if success:
        return {"message": "Account updated successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to update account")


@router.patch('/api/admin/account/{username}/delete')
async def delete_account(username: str, db=Depends(get_db_for_new_thread)):
    account_model = AccountModel(db)
    existing_account = account_model.get_account_by_username(username)

    if not existing_account:
        raise HTTPException(status_code=404, detail="Account not found")

    if existing_account.get('status') == 'deleted':
        raise HTTPException(status_code=400, detail="Account already deleted")

    success = account_model.update_account(username, {'status': 'deleted'})
    if success:
        return {"message": "Account deleted successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to delete account")