import {Dispatch} from 'redux'
import {setAppStatusAC} from '../../app/app-reducer'
import {authAPI, FieldErrorType, LoginParamsType} from '../../api/todolists-api'
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils'
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AxiosError} from "axios";


// типизация не нужна-все подтянет toolkit
// type InitialStateType = {
//     isLoggedIn: boolean
// }

// const initialState = {    ----// забросили его в slice
//     isLoggedIn: false
// }

//было
// export const loginTC = (data: LoginParamsType) => (dispatch: Dispatch) => {
//     dispatch(setAppStatusAC({status:'loading'}))
//     authAPI.login(data)
//         .then(res => {
//             if (res.data.resultCode === 0) {
//                 // dispatch(setIsLoggedInAC(true))                -так было до toolkit
//                 dispatch(slice.actions.setIsLoggedInAC({value:true}))
//                 dispatch(setAppStatusAC({status:'succeeded'}))
//             } else {
//                 handleServerAppError(res.data, dispatch)
//             }
//         })
//         .catch((error) => {
//             handleServerNetworkError(error, dispatch)
//         })
// }


//   ВРЕМЕННО                    ('название редюсера/...')
//                            thunkAPI-все что в санки приходило вторым параметром-GetState
// export const loginTC=createAsyncThunk('auth/login',(param: LoginParamsType,thunkAPI)=>{
//     thunkAPI.dispatch(setAppStatusAC({status:'loading'}))
//     authAPI.login(param)
//         .then(res => {
//             if (res.data.resultCode === 0) {
//                 // dispatch(setIsLoggedInAC(true))                -так было до toolkit
//                 thunkAPI.dispatch(slice.actions.setIsLoggedInAC({value:true}))
//                 thunkAPI.dispatch(setAppStatusAC({status:'succeeded'}))
//             } else {
//                 handleServerAppError(res.data, thunkAPI.dispatch)
//             }
//         })
//         .catch((error) => {
//             handleServerNetworkError(error, thunkAPI.dispatch)
//         })
// })


export const loginTC = createAsyncThunk<{ isLoggedIn: boolean }, LoginParamsType,
    { rejectValue: { errors: Array<string>, fieldsErrors?: Array<FieldErrorType> } }>('auth/login',
    async (param, thunkAPI) => {
        thunkAPI.dispatch(setAppStatusAC({status: 'loading'}))
        try {
            const res = await authAPI.login(param)
            if (res.data.resultCode === 0) {
                thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}))
                // thunkAPI.dispatch(slice.actions.setIsLoggedInAC({value: true}))
                //return {value: true}
                return {isLoggedIn: true} //переименовали чтобы было понятней
            } else {
                handleServerAppError(res.data, thunkAPI.dispatch)
                // return {isLoggedIn: false}
                return thunkAPI.rejectWithValue({errors: res.data.messages, fieldsErrors: res.data.fieldsErrors})
            }
        } catch (err) {
            // @ts-ignore
            let error: AxiosError = err;
            handleServerNetworkError({message: 'error'}, thunkAPI.dispatch)
            // handleServerNetworkError(error, thunkAPI.dispatch)
            return thunkAPI.rejectWithValue({errors: [error.message], fieldsErrors: undefined})
        }
    })

//было
// export const logoutTC = () => (dispatch: Dispatch) => {
//     dispatch(setAppStatusAC({status: 'loading'}))
//     authAPI.logout()
//         .then(res => {
//             if (res.data.resultCode === 0) {
//                 // dispatch(setIsLoggedInAC(false))                 -так было до toolkit
//                 dispatch(slice.actions.setIsLoggedInAC({value: false}))
//                 dispatch(setAppStatusAC({status: 'succeeded'}))
//             } else {
//                 handleServerAppError(res.data, dispatch)
//             }
//         })
//         .catch((error) => {
//             handleServerNetworkError(error, dispatch)
//         })
// }

export const logoutTC = createAsyncThunk('auth/logout', async (param, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({status: 'loading'}))
    try {
        let res = await authAPI.logout()
        if (res.data.resultCode === 0) {
            // dispatch(setIsLoggedInAC(false))                 -так было до toolkit
            thunkAPI.dispatch(slice.actions.setIsLoggedInAC({value: false}))
            thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}))

        } else {
            handleServerAppError(res.data, thunkAPI.dispatch)
        }
    } catch (err) {
        // @ts-ignore
        let error: AxiosError = err;
        handleServerNetworkError(error, thunkAPI.dispatch)
    }
})


// возвращает какой-то кусок
// тут и происходит вся магия: нам больше не нужны будут AC и authReducer
export const slice = createSlice({
    name: 'auth', //по названию редюсера
    initialState: {
        isLoggedIn: false
    },
    reducers: {
        //переносим в extraReducers но удалить не можем т.к много логики завязано на этом экшене
        setIsLoggedInAC(state, action: PayloadAction<{ value: boolean }>) {
            state.isLoggedIn = action.payload.value  // вставляем логику из кейса
        }
    },
    extraReducers: builder => {
        //        ThunkCreator  ActionCreator
        builder.addCase(loginTC.fulfilled, (state, action) => {
            //  без проверки сомневается есть ли payload, но т.к. у нас в санке стоят return
            // то здесь убрали if
            state.isLoggedIn = action.payload.isLoggedIn

        })
    }
})

export const authReducer = slice.reducer;

// authReducer -больше не нужен, вся магия будет происходить в slice
// export const authReducer = (state: InitialStateType = initialState, action: ActionsType): InitialStateType => {
//     switch (action.type) {
//         case 'login/SET-IS-LOGGED-IN':
//             return {...state, isLoggedIn: action.value}
//         default:
//             return state
//     }
// }

// actions -тоже больше не нужно
//type ActionsType = ReturnType<typeof setIsLoggedInAC>
// export const setIsLoggedInAC = (value: boolean) =>
//     ({type: 'login/SET-IS-LOGGED-IN', value} as const)


// thunks                                                                убрали типизацию из дженериков
// export const loginTC = (data: LoginParamsType) => (dispatch: Dispatch<ActionsType | SetAppStatusActionType | SetAppErrorActionType>) => {

// export const loginTC = (data: LoginParamsType) => (dispatch: Dispatch) => {
//     dispatch(setAppStatusAC({status:'loading'}))
//     authAPI.login(data)
//         .then(res => {
//             if (res.data.resultCode === 0) {
//                 // dispatch(setIsLoggedInAC(true))                -так было до toolkit
//                 dispatch(slice.actions.setIsLoggedInAC({value:true}))
//                 dispatch(setAppStatusAC({status:'succeeded'}))
//             } else {
//                 handleServerAppError(res.data, dispatch)
//             }
//         })
//         .catch((error) => {
//             handleServerNetworkError(error, dispatch)
//         })
// }


//                                                             убрали типизацию из дженериков
// export const logoutTC = () => (dispatch: Dispatch<ActionsType | SetAppStatusActionType | SetAppErrorActionType>) => {


//type ThunkDispatch = Dispatch<ActionsType | SetAppStatusActionType | SetAppErrorActionType>

