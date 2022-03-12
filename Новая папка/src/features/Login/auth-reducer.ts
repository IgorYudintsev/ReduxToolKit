import {Dispatch} from 'redux'
import {setAppStatusAC} from '../../app/app-reducer'
import {authAPI, LoginParamsType} from '../../api/todolists-api'
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils'
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

// типизация не нужна-все подтянет toolkit
// type InitialStateType = {
//     isLoggedIn: boolean
// }
const initialState = {
    isLoggedIn: false
}

// возвращает какой-то кусок
// тут и происходит вся магия: нам больше не нужны будут AC и authReducer
export const slice = createSlice({
    name: 'auth', //по названию редюсера
    initialState: initialState,
    reducers: {
        //т.к. у нас был один кейс, то и тут один
        setIsLoggedInAC(state, action: PayloadAction<{ value: boolean }>) {  // вставляем AC
            // PayloadAction-импортируется из Тулкита
            state.isLoggedIn = action.payload.value  // вставляем логику из кейса
            // данные приходят из payload-это объект-поэтому в санках тоже {}
        }
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
export const loginTC = (data: LoginParamsType) => (dispatch: Dispatch) => {
    dispatch(setAppStatusAC({status:'loading'}))
    authAPI.login(data)
        .then(res => {
            if (res.data.resultCode === 0) {
                // dispatch(setIsLoggedInAC(true))                -так было до toolkit
                dispatch(slice.actions.setIsLoggedInAC({value:true}))
                dispatch(setAppStatusAC({status:'succeeded'}))
            } else {
                handleServerAppError(res.data, dispatch)
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch)
        })
}
//                                                             убрали типизацию из дженериков
// export const logoutTC = () => (dispatch: Dispatch<ActionsType | SetAppStatusActionType | SetAppErrorActionType>) => {
export const logoutTC = () => (dispatch: Dispatch) => {
    dispatch(setAppStatusAC({status:'loading'}))
    authAPI.logout()
        .then(res => {
            if (res.data.resultCode === 0) {
                // dispatch(setIsLoggedInAC(false))                 -так было до toolkit
                dispatch(slice.actions.setIsLoggedInAC({ value: false }))
                dispatch(setAppStatusAC({status:'succeeded'}))
            } else {
                handleServerAppError(res.data, dispatch)
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch)
        })
}



//type ThunkDispatch = Dispatch<ActionsType | SetAppStatusActionType | SetAppErrorActionType>
