import {
    addTodolistTC,
    //AddTodolistActionType,
    //RemoveTodolistActionType,

    // addTodolistAC,
    // removeTodolistAC,
    fetchTodolistsTC, removeTodolistTC,
    //setTodolistsAC
} from './todolists-reducer'
import {
    TaskPriorities,
    TaskStatuses,
    TaskType,
    todolistsAPI,
    TodolistType,
    UpdateTaskModelType
} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {AppRootStateType} from '../../app/store'
import {setAppErrorAC, SetAppErrorActionType, setAppStatusAC, SetAppStatusActionType} from '../../app/app-reducer'
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils'
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {AxiosError} from "axios";

const initialState: TasksStateType = {}

// export const fetchTasksTC_ = (todolistId: string) => (dispatch: Dispatch) => {
//     dispatch(setAppStatusAC({status: 'loading'}))
//     todolistsAPI.getTasks(todolistId)
//         .then((res) => {
//             const tasks = res.data.items
//             dispatch(setTasksAC({tasks, todolistId}))
//             dispatch(setAppStatusAC({status: 'succeeded'}))
//         })
// }

export const fetchTasksTC = createAsyncThunk('tasks/fetchTasks',
    async (todolistId: string, thunkAPI) => {
        thunkAPI.dispatch(setAppStatusAC({status: 'loading'}))
        try {
            let res = await todolistsAPI.getTasks(todolistId)
            const tasks = res.data.items
            thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}))
            //thunkAPI.dispatch(setTasksAC( {tasks, todolistId}))
            // вместо dispatch(setTasksAC(...    return {tasks, todolistId}
            //передаем это в extraReducers: builder.addCase(fetchTasksTC.fulfilled,
            return {tasks, todolistId}
        } catch (err) {
            return thunkAPI.rejectWithValue(null)
        }
    })

// export const removeTaskTC = (taskId: string, todolistId: string) => (dispatch: Dispatch) => {
//     todolistsAPI.deleteTask(todolistId, taskId)
//         .then(res => {
//             const action = removeTaskAC({taskId, todolistId})
//             dispatch(action)
//         })
// }

export const removeTaskTC = createAsyncThunk('tasks/removeTasks',
    //  если передаем несколько параметров-заворачиваем в params:{taskId: string, todolistId: string}
    async (params: { taskId: string, todolistId: string }, thunkAPI) => {
        try {
            let res = await todolistsAPI.deleteTask(params.todolistId, params.taskId)
            //return {taskId, params.todolistId}
            return {taskId: params.taskId, todolistId: params.todolistId}
        } catch (err) {
            return thunkAPI.rejectWithValue(null)
        }
    })

// export const addTaskTC_ = (title: string, todolistId: string) => (dispatch: Dispatch) => {
//     dispatch(setAppStatusAC({status: 'loading'}))
//     todolistsAPI.createTask(todolistId, title)
//         .then(res => {
//             if (res.data.resultCode === 0) {
//                 const task = res.data.data.item
//                 const action = addTaskAC({task})
//                 dispatch(action)
//                 dispatch(setAppStatusAC({status: 'succeeded'}))
//             } else {
//                 handleServerAppError(res.data, dispatch)
//             }
//         })
//         .catch((error) => {
//             handleServerNetworkError(error, dispatch)
//         })
// }
export const addTaskTC = createAsyncThunk('tasks/addTask',
    async (params: { title: string, todolistId: string }, {dispatch, rejectWithValue}) => {
        dispatch(setAppStatusAC({status: 'loading'}))
        try {
            //let res = await todolistsAPI.deleteTask(params.todolistId, params.taskId)
            let res = await todolistsAPI.createTask(params.todolistId, params.title)
            if (res.data.resultCode === 0) {

                // const action = addTaskAC({task})
                // dispatch(action)
                dispatch(setAppStatusAC({status: 'succeeded'}))
                const task = res.data.data.item
                return {task}

            } else {
                handleServerAppError(res.data, dispatch)
                return rejectWithValue(null)
            }
        } catch (err) {
            // @ts-ignore
            let error: AxiosError = err;
            handleServerNetworkError(error, dispatch)
            return rejectWithValue(null)
        }
    })

//здесь у нас появился getState()
// export const updateTaskTC = createAsyncThunk('tasks/updateTask',
//     async (params: { taskId: string, model: UpdateDomainTaskModelType, todolistId: string }, {
//         dispatch, rejectWithValue, getState}) => {
//         const state = getState() as AppRootStateType //типизируем здесь
//         const task = state.tasks[params.todolistId].find(t => t.id === params.taskId)
//         if (!task) {
//             //throw new Error("task not found in the state");
//             console.warn('task not found in the state')
//             return rejectWithValue('task not found in the state')
//         }
//
//         const apiModel: UpdateTaskModelType = {
//             deadline: task.deadline,
//             description: task.description,
//             priority: task.priority,
//             startDate: task.startDate,
//             title: task.title,
//             status: task.status,
//             ...params.model
//         }
//         try {
//             let res = await todolistsAPI.updateTask(params.todolistId, params.taskId, apiModel)
//             if (res.data.resultCode === 0) {
//                 // const action = updateTaskAC({taskId, model, todolistId})
//                 // dispatch(action)
//                 return {params}
//             } else {
//                 handleServerAppError(res.data, dispatch)
//                 return rejectWithValue(null)
//             }
//         } catch (err) {
//             // @ts-ignore
//             let error: AxiosError = err;
//             handleServerNetworkError(error, dispatch)
//             return rejectWithValue(null)
//         }
//     })

export const updateTaskTC = createAsyncThunk('tasks/updateTask',
    //  если передаем несколько параметров-заворачиваем в params:{taskId: string, todolistId: string}
    async (params: { taskId: string, model: UpdateDomainTaskModelType, todolistId: string },
           {dispatch, rejectWithValue, getState}) => {
        let todolistId = params.todolistId
        let model = params.model
        let taskId = params.taskId
        const state = getState() as AppRootStateType
        const task = state.tasks[todolistId].find(t => t.id === taskId)
        if (!task) {
            //throw new Error("task not found in the state");
            return rejectWithValue('task not found in the state')
        }

        const apiModel: UpdateTaskModelType = {
            deadline: task.deadline,
            description: task.description,
            priority: task.priority,
            startDate: task.startDate,
            title: task.title,
            status: task.status,
            ...model
        }

        let res = await todolistsAPI.updateTask(todolistId, taskId, apiModel)
        try {

            if (res.data.resultCode === 0) {
                let action=updateTaskTC(params)
                return params
            } else {
                handleServerAppError(res.data, dispatch)
                return rejectWithValue(null)
            }
        }
        catch (err) {
            // @ts-ignore
            let error: AxiosError = err;
            handleServerNetworkError(error, dispatch)
            return rejectWithValue(null)
        }
    })



// export const updateTaskTC_ = (taskId: string, model: UpdateDomainTaskModelType, todolistId: string) =>
//     (dispatch: Dispatch, getState: () => AppRootStateType) => {
//         const state = getState()
//         const task = state.tasks[todolistId].find(t => t.id === taskId)
//         if (!task) {
//             //throw new Error("task not found in the state");
//             console.warn('task not found in the state')
//             return
//         }
//
//         const apiModel: UpdateTaskModelType = {
//             deadline: task.deadline,
//             description: task.description,
//             priority: task.priority,
//             startDate: task.startDate,
//             title: task.title,
//             status: task.status,
//             ...model
//         }
//
//         todolistsAPI.updateTask(todolistId, taskId, apiModel)
//             .then(res => {
//                 if (res.data.resultCode === 0) {
//                     const action = updateTaskAC({taskId, model, todolistId})
//                     dispatch(action)
//                 } else {
//                     handleServerAppError(res.data, dispatch)
//                 }
//             })
//             .catch((error) => {
//                 handleServerNetworkError(error, dispatch)
//             })
//     }


const slice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        // removeTaskAC(state, action: PayloadAction<{ taskId: string, todolistId: string }>) {
        //     const tasks = state[action.payload.todolistId]
        //     const index = tasks.findIndex(t => t.id === action.payload.taskId)
        //     if (index > -1) {
        //         tasks.splice(index, 1)
        //     }
        // },

        // addTaskAC(state, action: PayloadAction<{ task: TaskType }>) {
        //     state[action.payload.task.todoListId].unshift(action.payload.task)
        // },

        // updateTaskAC(state, action: PayloadAction<{ taskId: string, model: UpdateDomainTaskModelType, todolistId: string }>) {
        //     const tasks = state[action.payload.todolistId]
        //     const index = tasks.findIndex(t => t.id === action.payload.taskId)
        //     if (index > -1) {
        //         tasks[index] = {...tasks[index], ...action.payload.model}
        //     }
        // },

        // setTasksAC(state, action: PayloadAction<{ tasks: Array<TaskType>, todolistId: string }>) {
        //     state[action.payload.todolistId] = action.payload.tasks
        // }
    },
    extraReducers: (builder) => {
        builder.addCase(addTodolistTC.fulfilled, (state, action) => {
            state[action.payload.todolist.id] = [];
        });
        builder.addCase(removeTodolistTC.fulfilled, (state, action) => {
            delete state[action.payload.id];
        });
        builder.addCase(fetchTodolistsTC.fulfilled, (state, action) => {
            action.payload.todolists.forEach((tl: any) => {
                state[tl.id] = []
            })
        });
        builder.addCase(fetchTasksTC.fulfilled, (state, action) => {
            state[action.payload.todolistId] = action.payload.tasks
        });
        builder.addCase(removeTaskTC.fulfilled, (state, action) => {
            const tasks = state[action.payload.todolistId]
            const index = tasks.findIndex(t => t.id === action.payload.taskId)
            if (index > -1) {
                tasks.splice(index, 1)
            }
        });
        builder.addCase(addTaskTC.fulfilled, (state, action) => {
            state[action.payload.task.todoListId].unshift(action.payload.task)
        });
        builder.addCase(updateTaskTC.fulfilled, (state, action) => {
            const tasks = state[action.payload.todolistId]
            const index = tasks.findIndex(t => t.id === action.payload.taskId)
            if (index > -1) {
                tasks[index] = {...tasks[index], ...action.payload.model}
            }
        });
    }
})

export const tasksReducer = slice.reducer

// actions
export const {
    //removeTaskAC,
    //addTaskAC,
   // updateTaskAC,
    //setTasksAC
} = slice.actions


// types
export type UpdateDomainTaskModelType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}
export type TasksStateType = {
    [key: string]: Array<TaskType>
}

