import {authAPI, FieldErrorType, LoginParamsType, todolistsAPI, TodolistType} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {RequestStatusType, SetAppErrorActionType, setAppStatusAC, SetAppStatusActionType} from '../../app/app-reducer'
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils'
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AxiosError} from "axios";
import {UpdateDomainTaskModelType} from "./tasks-reducer";
import {loginTC, logoutTC} from "../Login/auth-reducer";

export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}
//const initialState: Array<TodolistDomainType> = []

// export const fetchTodolistsTC = () => {
//     return (dispatch: Dispatch) => {
//         dispatch(setAppStatusAC({status: 'loading'}))
//         todolistsAPI.getTodolists()
//             .then((res) => {
//                 dispatch(setTodolistsAC({todolists: res.data}))
//                 dispatch(setAppStatusAC({status: 'succeeded'}))
//             })
//             .catch(error => {
//                 handleServerNetworkError(error, dispatch)
//             })
//     }
// }
export const fetchTodolistsTC = createAsyncThunk('todolists/fetchTodolists',
    async (param, {dispatch, rejectWithValue}) => {
        dispatch(setAppStatusAC({status: 'loading'}))
        try {
            let res = await todolistsAPI.getTodolists()
                .then((res) => {
                    dispatch(setAppStatusAC({status: 'succeeded'}))
                    //dispatch(setTodolistsAC({todolists: res.data}))
                    return {todolists: res.data}
                })
                .catch(error => {
                    handleServerNetworkError(error, dispatch)
                })
        } catch (err) {
            // @ts-ignore
            let error: AxiosError = err;
            handleServerNetworkError(error, dispatch);
            return rejectWithValue(null)
        }
    })

// export const removeTodolistTC_ = (todolistId: string) => {
//     return (dispatch: Dispatch) => {
//         //?????????????? ???????????????????? ???????????? ????????????????????, ?????????? ???????????? ???????????? ????????????????
//         dispatch(setAppStatusAC({status: 'loading'}))
//         //?????????????? ???????????? ?????????????????????? ??????????????????, ?????????? ???? ?????? ?????????????????????? ?????? ????????
//         dispatch(changeTodolistEntityStatusAC({id: todolistId, status: 'loading'}))
//         todolistsAPI.deleteTodolist(todolistId)
//             .then((res) => {
//                 dispatch(removeTodolistAC({id: todolistId}))
//                 //???????????? ?????????????????? ????????????????????, ?????? ?????????????????????? ???????????????? ??????????????????
//                 dispatch(setAppStatusAC({status: 'succeeded'}))
//             })
//     }
// }
export const removeTodolistTC = createAsyncThunk('todolists/removeTodolists',
    async (param: { todolistId: string }, {dispatch}) => {
        dispatch(setAppStatusAC({status: 'loading'}))
        dispatch(changeTodolistEntityStatusAC({id: param.todolistId, status: 'loading'}))
        try {
            let res = await todolistsAPI.deleteTodolist(param.todolistId)
                .then((res) => {
                    dispatch(setAppStatusAC({status: 'succeeded'}))
                    // dispatch(removeTodolistAC({id: param.todolistId}))
                    return {id: param.todolistId}
                })
        } catch (err) {
            // @ts-ignore
            let error: AxiosError = err;
            handleServerNetworkError(error, dispatch);
        }
    })

export const todolistSlice = createSlice({
    name: 'todolists',
    initialState: [] as Array<TodolistDomainType>,
    reducers: {
        removeTodolistAC(state, action: PayloadAction<{ id: string }>) {
            // ???????????????????????? ???? ????????????...  state.filter(el=>el.id!=action.payload.id)
            const index = state.findIndex(el => el.id === action.payload.id)
            if (index > -1) {
                state.splice(index, 1)
            }
        },
        addTodolistAC(state, action: PayloadAction<{ todolist: TodolistType }>) {
            // ???????????????????????? ???? ????????????...  [{...action.payload.todolist,filter:'all',entityStatus: 'idle'},...state]
            state.unshift({...action.payload.todolist, filter: 'all', entityStatus: 'idle'})
        },

        changeTodolistTitleAC(state, action: PayloadAction<{ id: string, title: string }>) {
            // ???????????????????????? ???? ????????????...    state.map(tl => tl.id === action.payload.id ? {...tl, title: action.payload.title} : tl)
            const index = state.findIndex(el => el.id === action.payload.id)
            state[index].title = action.payload.title
        },

        changeTodolistFilterAC(state, action: PayloadAction<{ id: string, filter: FilterValuesType }>) {
            // ???????????????????????? ???? ????????????...    state.map(tl => tl.id === action.payload.id ? {...tl, filter: action.payload.filter} : tl)
            const index = state.findIndex(tl => tl.id === action.payload.id);
            state[index].filter = action.payload.filter;
        },

        changeTodolistEntityStatusAC(state, action: PayloadAction<{ id: string, status: RequestStatusType }>) {
            // ???????????????????????? ???? ????????????...   state.map(tl => tl.id === action.payload.id ? {...tl, entityStatus: action.payload.status} : tl)
            const index = state.findIndex(tl => tl.id === action.payload.id);
            state[index].entityStatus = action.payload.status
        },
        // setTodolistsAC(state, action: PayloadAction<{ todolists: Array<TodolistType> }>) {
        //     // ?????????????????????? return -???????????????????? ?????????????????? ??????????
        //     return action.payload.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
        // },

    },
    extraReducers: builder => {
        builder.addCase(fetchTodolistsTC.fulfilled, (state, action) => {
            // @ts-ignore
            return action.payload.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))

        })
        builder.addCase(removeTodolistTC.fulfilled, (state, action) => {
            //delete state[action.payload.id];
            const index = state.findIndex(el => el.id === action.meta.arg.todolistId)
            if (index > -1) {
                state.splice(index, 1)
            }
        })
    }
})


export const todolistsReducer = todolistSlice.reducer;
export const {
    removeTodolistAC,
    addTodolistAC,
    changeTodolistTitleAC,
    changeTodolistFilterAC,
    changeTodolistEntityStatusAC,
    // setTodolistsAC
} = todolistSlice.actions


// export const todolistsReducer = (state: Array<TodolistDomainType> = initialState, action: ActionsType): Array<TodolistDomainType> => {
//     switch (action.type) {
//         case 'REMOVE-TODOLIST':
//             return state.filter(tl => tl.id != action.id)
//         case 'ADD-TODOLIST':
//             return [{...action.todolist, filter: 'all', entityStatus: 'idle'}, ...state]
//
//         case 'CHANGE-TODOLIST-TITLE':
//             return state.map(tl => tl.id === action.id ? {...tl, title: action.title} : tl)
//         case 'CHANGE-TODOLIST-FILTER':
//             return state.map(tl => tl.id === action.id ? {...tl, filter: action.filter} : tl)
//         case 'CHANGE-TODOLIST-ENTITY-STATUS':
//             return state.map(tl => tl.id === action.id ? {...tl, entityStatus: action.status} : tl)
//         case 'SET-TODOLISTS':
//             return action.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
//         default:
//             return state
//     }
// }

// actions
// export const removeTodolistAC = (id: string) => ({type: 'REMOVE-TODOLIST', id} as const)
// export const addTodolistAC = (todolist: TodolistType) => ({type: 'ADD-TODOLIST', todolist} as const)
// export const changeTodolistTitleAC = (id: string, title: string) => ({
//     type: 'CHANGE-TODOLIST-TITLE',
//     id,
//     title
// } as const)
// export const changeTodolistFilterAC = (id: string, filter: FilterValuesType) => ({
//     type: 'CHANGE-TODOLIST-FILTER',
//     id,
//     filter
// } as const)
// export const changeTodolistEntityStatusAC = (id: string, status: RequestStatusType) => ({
//     type: 'CHANGE-TODOLIST-ENTITY-STATUS', id, status } as const)
// export const setTodolistsAC = (todolists: Array<TodolistType>) => ({type: 'SET-TODOLISTS', todolists} as const)

// thunks


export const addTodolistTC = (title: string) => {
    return (dispatch: Dispatch) => {
        dispatch(setAppStatusAC({status: 'loading'}))
        todolistsAPI.createTodolist(title)
            .then((res) => {
                dispatch(addTodolistAC({todolist: res.data.data.item}))
                dispatch(setAppStatusAC({status: 'succeeded'}))
            })
    }
}
export const changeTodolistTitleTC = (id: string, title: string) => {
    return (dispatch: Dispatch) => {
        todolistsAPI.updateTodolist(id, title)
            .then((res) => {
                dispatch(changeTodolistTitleAC({id: id, title: title}))
            })
    }
}

// types
export type AddTodolistActionType = ReturnType<typeof addTodolistAC>;
export type RemoveTodolistActionType = ReturnType<typeof removeTodolistAC>;
//export type SetTodolistsActionType = ReturnType<typeof setTodolistsAC>;
// type ActionsType =
//     | RemoveTodolistActionType
//     | AddTodolistActionType
//     | ReturnType<typeof changeTodolistTitleAC>
//     | ReturnType<typeof changeTodolistFilterAC>
//     | SetTodolistsActionType
//     | ReturnType<typeof changeTodolistEntityStatusAC>

// type ThunkDispatch = Dispatch<AddTodolistActionType,RemoveTodolistActionType,SetTodolistsActionType>
//type ThunkDispatch = Dispatch<SetAppStatusActionType | SetAppErrorActionType>
