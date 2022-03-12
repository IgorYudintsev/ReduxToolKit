import {
    addTodolistAC,
    AddTodolistActionType,
    FilterValuesType, removeTodolistAC,
    RemoveTodolistActionType, setTodolistsAC,
    SetTodolistsActionType
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
import {RequestStatusType, setAppErrorAC, setAppStatusAC} from '../../app/app-reducer'
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils'
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Simulate} from "react-dom/test-utils";




export type TasksStateType = {
    [key: string]: Array<TaskType>
}
const initialState: TasksStateType = {}

// было
// export const fetchTasksTC = (todolistId: string) => (dispatch: Dispatch) => {
//     dispatch(setAppStatusAC({status: 'loading'}))
//     todolistsAPI.getTasks(todolistId)
//         .then((res) => {
//             const tasks = res.data.items
//             dispatch(setTasksAC({tasks: tasks, todolistId: todolistId}))
//             dispatch(setAppStatusAC({status: 'succeeded'}))
//         })
// }

//new thunk                                'название редюсера/название санки'
export const fetchTasksTC = createAsyncThunk('tasks/fethTasks',
    //если передаем один параметр: todolistId: string- то все ок
    //если несколько заворачиваем их в объект payload
    //thunkAPI-это интерфейс в который запакованы dispatch, getState и другие параметры
    async(todolistId: string, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({status: 'loading'}))
    let res=await todolistsAPI.getTasks(todolistId)
    const tasks = res.data.items
    thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}))
    //thunkAPI.dispatch(setTasksAC({tasks,todolistId}))
        // вместо dispatch(setTasksAC...) просто возвращаем:
    return {tasks, todolistId}
})

// было
// export const removeTaskTC = (taskId: string, todolistId: string) => (dispatch: Dispatch) => {
//     todolistsAPI.deleteTask(todolistId, taskId)
//         .then(res => {
//             const action = removeTaskAC({taskId: taskId, todolistId: todolistId})
//             dispatch(action)
//         })
// }

// временно
// export const removeTaskTC = createAsyncThunk('tasks/removeTask',
//     (param:{taskId:string,todolistId: string}, thunkAPI) => {
//     return  todolistsAPI.deleteTask(param.todolistId, param.taskId)
//         .then(res=>({taskId: param.taskId, todolistId: param.todolistId}))
//    })

export const removeTaskTC = createAsyncThunk('tasks/removeTask',
    async(param:{taskId:string,todolistId: string}, thunkAPI) => {
        const res=await todolistsAPI.deleteTask(param.todolistId, param.taskId)
            return {taskId: param.taskId, todolistId: param.todolistId}
    })



export const addTaskTC = createAsyncThunk('tasks/addTask', async(param:{todolistId: string,title:string}, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({status: 'loading'}))
    let res=await todolistsAPI.createTask(param.todolistId, param.title)
    if (res.data.resultCode === 0) {
        const task = res.data.data.item
        const action = addTaskAC( {task: task})
        thunkAPI.dispatch(action)
        thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}))
    } else {
        handleServerAppError(res.data, thunkAPI.dispatch);
    }
    handleServerNetworkError({ message: "vse propslo!" }, thunkAPI.dispatch)
})


export const tasksSlice = createSlice({
    name: 'tasks',
    initialState: initialState,
    reducers: {
        // перенесли в extraReducers
       // removeTaskAC(state, action: PayloadAction<{ taskId: string, todolistId: string }>) {
            // return {...state, [action.todolistId]: state[action.todolistId].filter(t => t.id != action.taskId)}

            // переносим
            // let tasks = state[action.payload.todolistId];
            // let index = tasks.findIndex(f => f.id === action.payload.taskId)
            // if (index > -1) {
            //     tasks.splice(index, 1)
            // }
        //},
        addTaskAC(state, action: PayloadAction<{task:TaskType} >) {
            //return {...state, [action.task.todoListId]: [action.task, ...state[action.task.todoListId]]}
            state[action.payload.task.todoListId].unshift(action.payload.task)
        },
        updateTaskAC(state, action: PayloadAction<{ taskId: string, model: UpdateDomainTaskModelType, todolistId: string }>) {
            //           return {...state, [action.todolistId]: state[action.todolistId]
            //         .map(t => t.id === action.taskId ? {...t, ...action.model} : t)
            // }
            let tasks = state[action.payload.todolistId];
            let index = tasks.findIndex(f => f.id === action.payload.taskId)
            if (index > -1) {
                tasks[index] = {...tasks[index], ...action.payload.model}
            }

        },

        //больше не нужен т.к. переехал в extraReducers builder.addCase(fetchTasksTC.fulfilled,..
        // setTasksAC(state, action: PayloadAction<{ tasks: Array<TaskType>, todolistId: string }>) {
        //    // return {...state, [action.todolistId]: action.tasks}
        //     state[action.payload.todolistId] = action.payload.tasks
        // }
    },
    //сюда вставляем редюсеры от тудулистРедюсера
    extraReducers: (builder) => {
        builder.addCase(addTodolistAC, (state, action) => {
            state[action.payload.todolist.id] = []
        });
        builder.addCase(removeTodolistAC, (state, action) => {
            delete state[action.payload.id];
        });
        builder.addCase(setTodolistsAC, (state, action) => {
            action.payload.todolists.forEach((tl: any) => {
                state[tl.id] = []
            })
        });
        //          обработать когда все будет хорошо
        builder.addCase(fetchTasksTC.fulfilled, (state, action) => {
            state[action.payload.todolistId] = action.payload.tasks
        });
        builder.addCase(removeTaskTC.fulfilled, (state, action) => {
            let tasks = state[action.payload.todolistId];
            let index = tasks.findIndex(f => f.id === action.payload.taskId)
            if (index > -1) {
                tasks.splice(index, 1)
            }
        });
    }

})
export const tasksReducer = tasksSlice.reducer;
export const {
    // removeTaskAC,
    addTaskAC, updateTaskAC
    // , setTasksAC
    } = tasksSlice.actions


// export const tasksReducer = (state: TasksStateType = initialState, action: ActionsType): TasksStateType => {
//     switch (action.type) {
//         case 'REMOVE-TASK':
//             return {...state, [action.todolistId]: state[action.todolistId].filter(t => t.id != action.taskId)}
//         case 'ADD-TASK':
//             return {...state, [action.task.todoListId]: [action.task, ...state[action.task.todoListId]]}
//         case 'UPDATE-TASK':
//             return {
//                 ...state,
//                 [action.todolistId]: state[action.todolistId]
//                     .map(t => t.id === action.taskId ? {...t, ...action.model} : t)
//             }
//         case 'ADD-TODOLIST':
//             return {...state, [action.todolist.id]: []}
//         case 'REMOVE-TODOLIST':
//             const copyState = {...state}
//             delete copyState[action.id]
//             return copyState
//         case 'SET-TODOLISTS': {
//             const copyState = {...state}
//             action.todolists.forEach(tl => {
//                 copyState[tl.id] = []
//             })
//             return copyState
//         }
//         case 'SET-TASKS':
//             return {...state, [action.todolistId]: action.tasks}
//         default:
//             return state
//     }
// }

// actions
// export const removeTaskAC = (taskId: string, todolistId: string) =>
//     ({type: 'REMOVE-TASK', taskId, todolistId} as const)
// export const addTaskAC = (task: TaskType) =>
//     ({type: 'ADD-TASK', task} as const)
// export const updateTaskAC = (taskId: string, model: UpdateDomainTaskModelType, todolistId: string) =>
//     ({type: 'UPDATE-TASK', model, todolistId, taskId} as const)
// export const setTasksAC = (tasks: Array<TaskType>, todolistId: string) =>
//     ({type: 'SET-TASKS', tasks, todolistId} as const)

// thunks
// export const fetchTasksTC = (todolistId: string) => (dispatch: Dispatch) => {
//     dispatch(setAppStatusAC({status: 'loading'}))
//     todolistsAPI.getTasks(todolistId)
//         .then((res) => {
//             const tasks = res.data.items
//             dispatch(setTasksAC({tasks: tasks, todolistId: todolistId}))
//             dispatch(setAppStatusAC({status: 'succeeded'}))
//         })
// }
// export const removeTaskTC = (taskId: string, todolistId: string) => (dispatch: Dispatch) => {
//     todolistsAPI.deleteTask(todolistId, taskId)
//         .then(res => {
//             const action = removeTaskAC({taskId: taskId, todolistId: todolistId})
//             dispatch(action)
//         })
// }
// export const addTaskTC = (title: string, todolistId: string) => (dispatch: Dispatch) => {
//     dispatch(setAppStatusAC({status: 'loading'}))
//     todolistsAPI.createTask(todolistId, title)
//         .then(res => {
//             if (res.data.resultCode === 0) {
//                 const task = res.data.data.item
//                 const action = addTaskAC({task: task})
//                 dispatch(action)
//                 dispatch(setAppStatusAC({status: 'succeeded'}))
//             } else {
//                 handleServerAppError(res.data, dispatch);
//             }
//         })
//         .catch((error) => {
//             handleServerNetworkError(error, dispatch)
//         })
// }
export const updateTaskTC = (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string) =>
    (dispatch: ThunkDispatch, getState: () => AppRootStateType) => {
        const state = getState()
        const task = state.tasks[todolistId].find(t => t.id === taskId)
        if (!task) {
            //throw new Error("task not found in the state");
            console.warn('task not found in the state')
            return
        }

        const apiModel: UpdateTaskModelType = {
            deadline: task.deadline,
            description: task.description,
            priority: task.priority,
            startDate: task.startDate,
            title: task.title,
            status: task.status,
            ...domainModel
        }

        todolistsAPI.updateTask(todolistId, taskId, apiModel)
            .then(res => {
                if (res.data.resultCode === 0) {
                    const action = updateTaskAC({taskId: taskId, model: domainModel, todolistId: todolistId})
                    dispatch(action)
                } else {
                    handleServerAppError(res.data, dispatch);
                }
            })
            .catch((error) => {
                handleServerNetworkError(error, dispatch);
            })
    }

// types
export type UpdateDomainTaskModelType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}

// type ActionsType =
//     | ReturnType<typeof removeTaskAC>
//     | ReturnType<typeof addTaskAC>
//     | ReturnType<typeof updateTaskAC>
//     | AddTodolistActionType
//     | RemoveTodolistActionType
//     | SetTodolistsActionType
//     | ReturnType<typeof setTasksAC>
type ThunkDispatch = Dispatch
