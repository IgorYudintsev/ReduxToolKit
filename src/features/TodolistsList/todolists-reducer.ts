import {todolistsAPI, TodolistType} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {
    initializeAppTC,
    RequestStatusType,
    SetAppErrorActionType,
    setAppStatusAC,
    SetAppStatusActionType
} from '../../app/app-reducer'
import {handleServerNetworkError} from '../../utils/error-utils'
import {createAsyncThunk, createSlice, PayloadAction, ThunkDispatch} from '@reduxjs/toolkit'
import {addTaskTC, fetchTasksTC, removeTaskTC, updateTaskTC} from "./tasks-reducer";
import {AxiosError} from "axios";

const initialState: Array<TodolistDomainType> = []


export const fetchTodolistsTC = createAsyncThunk('todolists/fetchTodolists',
    async (param, {dispatch, rejectWithValue}) => {
        dispatch(setAppStatusAC({status: 'loading'}))
        let res = await todolistsAPI.getTodolists()
        try {
            dispatch(setAppStatusAC({status: 'succeeded'}))
            //dispatch(setTodolistsAC({todolists: res.data}))
            return {todolists: res.data}

        } catch (err) {
            // @ts-ignore
            let error: AxiosError = err;
            handleServerNetworkError(error, dispatch)
            return rejectWithValue(null)
        }
    })

export const removeTodolistTC = createAsyncThunk('todolists/removeTodolist',
    async (todolistId: string, {dispatch, rejectWithValue}) => {
        dispatch(setAppStatusAC({status: 'loading'}))
        dispatch(changeTodolistEntityStatusAC({id: todolistId, status: 'loading'}))
        let res = await todolistsAPI.deleteTodolist(todolistId)
        try {
            dispatch(setAppStatusAC({status: 'succeeded'}))
            //dispatch(removeTodolistAC({id: todolistId}))
            return {id: todolistId}
        } catch (err) {
            // @ts-ignore
            let error: AxiosError = err;
            handleServerNetworkError(error, dispatch)
            return rejectWithValue(null)
        }
    })


export const addTodolistTC = createAsyncThunk('todolists/addTodolist',
    async (title: string, {dispatch, rejectWithValue}) => {
        dispatch(setAppStatusAC({status: 'loading'}))

        let res = await todolistsAPI.createTodolist(title)
        try {
            dispatch(setAppStatusAC({status: 'succeeded'}))
            //dispatch(addTodolistAC({todolist: res.data.data.item}))
            return {todolist: res.data.data.item}
        } catch (err) {
            // @ts-ignore
            let error: AxiosError = err;
            handleServerNetworkError(error, dispatch)
            return rejectWithValue(null)
        }
    })

export const changeTodolistTitleTC = createAsyncThunk('todolists/changeTodolistTitle',
    async (params: {id: string, title: string}, {dispatch, rejectWithValue}) => {
         let res = await todolistsAPI.updateTodolist(params.id, params.title)
        try {
            //dispatch(changeTodolistTitleAC({id: id, title}))
           return {id: params.id, title: params.title}
        } catch (err) {
            // @ts-ignore
            let error: AxiosError = err;
            handleServerNetworkError(error, dispatch)
            return rejectWithValue(null)
        }
    })

// export const changeTodolistTitleTC_ = (id: string, title: string) => {
//     return (dispatch: Dispatch) => {
//         todolistsAPI.updateTodolist(id, title)
//             .then((res) => {
//                 dispatch(changeTodolistTitleAC({id: id, title}))
//             })
//     }
// }


const slice = createSlice({
    name: 'todolists',
    initialState: [] as Array<TodolistDomainType>,
    reducers: {
        // removeTodolistAC(state, action: PayloadAction<{ id: string }>) {
        //     const index = state.findIndex(tl => tl.id === action.payload.id);
        //     if (index > -1) {
        //         state.splice(index, 1);
        //     }
        // },
        // addTodolistAC(state, action: PayloadAction<{ todolist: TodolistType }>) {
        //     state.unshift({...action.payload.todolist, filter: 'all', entityStatus: 'idle'})
        // },
        changeTodolistTitleAC(state, action: PayloadAction<{ id: string, title: string }>) {
            const index = state.findIndex(tl => tl.id === action.payload.id);
            state[index].title = action.payload.title;
        },
        changeTodolistFilterAC(state, action: PayloadAction<{ id: string, filter: FilterValuesType }>) {
            const index = state.findIndex(tl => tl.id === action.payload.id);
            state[index].filter = action.payload.filter;
        },
        changeTodolistEntityStatusAC(state, action: PayloadAction<{ id: string, status: RequestStatusType }>) {
            const index = state.findIndex(tl => tl.id === action.payload.id);
            state[index].entityStatus = action.payload.status;
        },
        // setTodolistsAC(state, action: PayloadAction<{ todolists: Array<TodolistType> }>) {
        //     return action.payload.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
        // }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchTodolistsTC.fulfilled, (state, action) => {
            return action.payload.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
        });
        builder.addCase(removeTodolistTC.fulfilled, (state, action) => {
            const index = state.findIndex(tl => tl.id === action.payload.id);
            if (index > -1) {
                state.splice(index, 1);
            }
        });
        builder.addCase(addTodolistTC.fulfilled, (state, action) => {
            state.unshift({...action.payload.todolist, filter: 'all', entityStatus: 'idle'})
        });
        builder.addCase(changeTodolistTitleTC.fulfilled, (state, action) => {
            const index = state.findIndex(tl => tl.id === action.payload.id);
            state[index].title = action.payload.title;
        });
    }
})

export const todolistsReducer = slice.reducer
export const {
    //removeTodolistAC,
    //addTodolistAC,
    changeTodolistTitleAC
    , changeTodolistFilterAC, changeTodolistEntityStatusAC,
    //setTodolistsAC
} = slice.actions

// thunks




// types
//export type AddTodolistActionType = ReturnType<typeof addTodolistAC>;
//export type RemoveTodolistActionType = ReturnType<typeof removeTodolistAC>;
//export type SetTodolistsActionType = ReturnType<typeof setTodolistsAC>;

export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}
