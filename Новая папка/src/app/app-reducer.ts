import {Dispatch} from 'redux'
import {authAPI} from '../api/todolists-api'
import {slice} from "../features/Login/auth-reducer";
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
// import {setIsLoggedInAC} from '../features/Login/auth-reducer'

export type InitialStateType = {
    status: RequestStatusType
    error: string | null
    isInitialized: boolean
}

const initialState: InitialStateType = {
    status: 'idle',
    error: null,
    isInitialized: false
}


export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'


// export const initializeAppTC = () => (dispatch: Dispatch) => {
//     authAPI.me().then(res => {
//         if (res.data.resultCode === 0) {
//             dispatch(slice.actions.setIsLoggedInAC({value:true}));
//         } else {
//
//         }
//
//         //dispatch(setAppInitializedAC(true));
//         dispatch(setAppInitializedAC({value:true}));
//     })
// }


export const initializeAppTC = createAsyncThunk('app/initializeApp', async (param, {dispatch}) => {

    let res = await authAPI.me()
    if (res.data.resultCode === 0) {
        dispatch(slice.actions.setIsLoggedInAC({value: true}));
    }
})


export const appSlice = createSlice({
    name: 'app',
    initialState: initialState,
    reducers: {
        setAppErrorAC(state, action: PayloadAction<{ error: string | null }>) {
            state.error = action.payload.error
        },
        setAppStatusAC(state, action: PayloadAction<{ status: RequestStatusType }>) {
            state.status = action.payload.status
        },
    },
    extraReducers: builder => {
        builder.addCase(initializeAppTC.fulfilled, (state) => {
            state.isInitialized = true
        })
    }
})

export const appReducer = appSlice.reducer;

export const {
    // setAppInitializedAC,
    setAppStatusAC, setAppErrorAC
} = appSlice.actions

// export const appReducer = (state: InitialStateType = initialState, action: ActionsType): InitialStateType => {
//     switch (action.type) {
//         case 'APP/SET-STATUS':
//             return {...state, status: action.status}
//         case 'APP/SET-ERROR':
//             return {...state, error: action.error}
//         case 'APP/SET-IS-INITIALIED':
//             return {...state, isInitialized: action.value}
//         default:
//             return {...state}
//     }
// }


//export const setAppErrorAC = (error: string | null) => ({type: 'APP/SET-ERROR', error} as const)
//export const setAppStatusAC = (status: RequestStatusType) => ({type: 'APP/SET-STATUS', status} as const)
//export const setAppInitializedAC = (value: boolean) => ({type: 'APP/SET-IS-INITIALIED', value} as const)


export type SetAppErrorActionType = ReturnType<typeof setAppErrorAC>
export type SetAppStatusActionType = ReturnType<typeof setAppStatusAC>
//
//
// type ActionsType =
//     | SetAppErrorActionType
//     | SetAppStatusActionType
//     | ReturnType<typeof setAppInitializedAC>
