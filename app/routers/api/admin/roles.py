from fastapi import Depends, HTTPException, Request, Response
from app.models.role import RolesModel
from app.dependencies import router, get_db_for_new_thread

@router.get('/api/admin/roles')
async def roles(db=Depends(get_db_for_new_thread)):
    roles_model = RolesModel(db)
    roles = roles_model.get_roles()
    return roles

@router.get('/api/admin/role/{role_id}')
async def get_roles(role_id: int, db=Depends(get_db_for_new_thread)):
    role_model = RolesModel(db)
    role = role_model.get_role_by_id(role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role

@router.post("/api/admin/role")
async def create_role(request: Request, db=Depends(get_db_for_new_thread)):
    try:
        data = await request.json()
        role = data.get("role")
        description = data.get("description")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    if not role:
        raise HTTPException(status_code=400, detail="Role is required")

    role_model = RolesModel(db)

    try:
        role_model.insert_role(role, description)
        return {"message": "Role created or updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create role")


@router.put("/api/admin/role/{role_id}")
async def update_role(role_id: int, request: Request, db=Depends(get_db_for_new_thread)):
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

    role_model = RolesModel(db)

    if not role_model.get_role_by_id(role_id):
        raise HTTPException(status_code=404, detail="Role not found")

    success = role_model.update_role(role_id, data)

    if success:
        return {"message": "Role updated successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to update role")

@router.patch('/api/admin/role/{role_id}/delete')
async def delete_role(role_id: int, db=Depends(get_db_for_new_thread)):
    role_model = RolesModel(db)
    existing_role = role_model.get_role_by_id(role_id)

    if not existing_role:
        raise HTTPException(status_code=404, detail="Role not found")

    if existing_role.get('status') == 'deleted':
        raise HTTPException(status_code=400, detail="Role already deleted")

    success = role_model.delete_role(role_id)
    if success:
        return {"message": "Role deleted successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to delete role")