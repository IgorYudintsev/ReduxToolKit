import {Dispatch} from 'redux'
import {authAPI, FieldErrorType, LoginParamsType} from '../api/todolists-api'
//import {setIsLoggedInAC} from '../features/Login/auth-reducer'
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {loginTC, setIsLoggedInAC} from "../features/Login/auth-reducer";
import {handleServerAppError, handleServerNetworkError} from "../utils/error-utils";
import {AxiosError} from "axios";

// const initialState: InitialStateType = {
//     status: 'idle',
//     error: null,
//     isInitialized: false
// }


export const initializeAppTC = createAsyncThunk('app/initialize',
    async (param, thunkAPI) => {
        try {
            const res = await authAPI.me()
            if (res.data.resultCode === 0) {
                thunkAPI.dispatch(setIsLoggedInAC({value: true}))
            }
            // return {isInitialized: true}

        } catch (err) {
            // @ts-ignore
            let error: AxiosError = err;
            handleServerNetworkError({message: 'error'}, thunkAPI.dispatch)
            // handleServerNetworkError(error, thunkAPI.dispatch)
            return thunkAPI.rejectWithValue({errors: [error.message], fieldsErrors: undefined})
        }
    })

// export const initializeAppTC_ = () => (dispatch: Dispatch) => {
//     authAPI.me().then(res => {
//         if (res.data.resultCode === 0) {
//             //dispatch(slice.actions.setIsLoggedInAC({value: true}))
//             //dispatch(loginTC.fulfilled({value: true},))
//             dispatch(setIsLoggedInAC({value: true},))
//         } else {
//
//         }
//
//         dispatch(setAppInitializedAC({isInitialized: true}))
//     })
// }


const slice = createSlice({
    name: 'app',
    initialState: {
        status: 'idle',
        error: null,
        isInitialized: false
    } as InitialStateType,
    reducers: {
        setAppStatusAC: (state, action: PayloadAction<{ status: RequestStatusType }>) => {
            state.status = action.payload.status
        },
        setAppErrorAC: (state, action: PayloadAction<{ error: string | null }>) => {
            state.error = action.payload.error
        },
        // setAppInitializedAC: (state, action: PayloadAction<{ isInitialized: boolean }>) => {
        //     state.isInitialized = action.payload.isInitialized
        // }
    },
    extraReducers: builder => {
        builder.addCase(initializeAppTC.fulfilled, (state, action) => {
            state.isInitialized = true
        });
    }
})

export const appReducer = slice.reducer

export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'
export type InitialStateType = {
    // происходит ли сейчас взаимодействие с сервером
    status: RequestStatusType
    // если ошибка какая-то глобальная произойдёт - мы запишем текст ошибки сюда
    error: string | null
    // true когда приложение проинициализировалось (проверили юзера, настройки получили и т.д.)
    isInitialized: boolean
}

export const {
    setAppErrorAC,
    setAppStatusAC,
    //setAppInitializedAC
} = slice.actions


export type SetAppErrorActionType = ReturnType<typeof setAppErrorAC>
export type SetAppStatusActionType = ReturnType<typeof setAppStatusAC>

