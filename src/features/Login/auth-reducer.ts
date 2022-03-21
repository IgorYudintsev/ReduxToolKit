import {Dispatch} from 'redux'
import {SetAppErrorActionType, setAppStatusAC, SetAppStatusActionType} from '../../app/app-reducer'
import {authAPI, FieldErrorType, LoginParamsType} from '../../api/todolists-api'
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils'
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {AxiosError} from "axios";

const initialState = {
    isLoggedIn: false
}

export const loginTC = createAsyncThunk<undefined, LoginParamsType,
    { rejectValue: { errors: Array<string>, fieldsErrors?: Array<FieldErrorType> } }>('auth/login',
    async (param, thunkAPI) => {
        thunkAPI.dispatch(setAppStatusAC({status: 'loading'}))
        try {
            const res = await authAPI.login(param)
            if (res.data.resultCode === 0) {
                thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}))
                // thunkAPI.dispatch(slice.actions.setIsLoggedInAC({value: true}))
                //return {value: true}

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

export const logoutTC = createAsyncThunk('auth/logout',
    async (param, thunkAPI) => {
        thunkAPI.dispatch(setAppStatusAC({status: 'loading'}))
        try {
            const res = await authAPI.logout()
            if (res.data.resultCode === 0) {
                thunkAPI.dispatch(setIsLoggedInAC({value: false}))
                return {status: 'succeeded'}
            } else {
                handleServerAppError(res.data, thunkAPI.dispatch)
            }

        } catch (err) {

            // @ts-ignore
            let error: AxiosError = err;
            handleServerNetworkError({message: 'error'}, thunkAPI.dispatch)
            // handleServerNetworkError(error, thunkAPI.dispatch)
            return thunkAPI.rejectWithValue({errors: [error.message], fieldsErrors: undefined})
        }
    })

const slice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
        setIsLoggedInAC(state, action: PayloadAction<{ value: boolean }>) {
            state.isLoggedIn = action.payload.value
        }
    },
    extraReducers: builder => {
        //        ThunkCreator  ActionCreator
        builder.addCase(loginTC.fulfilled, (state) => {
            //  без проверки сомневается есть ли payload, но т.к. у нас в санке стоят return
            // то здесь убрали if
            state.isLoggedIn = true
        })
        builder.addCase(logoutTC.fulfilled, (state) => {
            state.isLoggedIn = false
        })
    }

})

export const authReducer = slice.reducer
export const {setIsLoggedInAC} = slice.actions

const a1 = {
    type: 'SET-IS-LOGIN-IN',
    payload: {
        value: true
    }
}
const a2 = {
    type: 'SET-blabal',
    payload: {
        user: {name: "sdsd"},
        age: 12
    }
}

