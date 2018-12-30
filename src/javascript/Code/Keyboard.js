import EventEmitter from '../EventEmitter.js'

export default class Keyboard extends EventEmitter
{
    constructor()
    {
        super()

        this.knownKeyNames = {
            8: 'backspace',
            9: 'tab',
            13: 'enter',
            16: 'shift',
            17: 'ctrl',
            18: 'alt',
            20: 'caps',
            27: 'esc',
            32: 'space',
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down',
            46: 'delete',
            91: 'command'
        }

        this.downItems = []

        this.setInteractions()
    }

    setInteractions()
    {
        // Down
        const keydownHandle = (_event) =>
        {
            const character = this.keycodeToCharacter(_event.keyCode)
            const downItems = [ ...this.downItems, character ]

            // Not saved yet
            if(!this.downItems.includes(character))
            {
                // CMD exception
                if(!this.isDown('command') || character === 'shift' || character === 'alt')
                {
                    this.downItems.push(character)
                }
            }

            // Trigger event
            const trigger = this.trigger('down', [ _event.keyCode, character, downItems ])

            // Trigger and prevend default if asked by return false on callback
            if(trigger === false)
            {
                _event.preventDefault()
            }
        }

        // Up
        const keyupHandle = (_event) =>
        {
            const character = this.keycodeToCharacter(_event.keyCode)

            if(this.downItems.indexOf(character) !== - 1)
            {
                this.downItems.splice(this.downItems.indexOf(character), 1)
            }

            this.trigger('up', [ _event.keyCode, character ])
        }

        // Focus
        const focusHandle = () =>
        {
            this.downItems = []
        }

        // Listen
        document.addEventListener('keydown', keydownHandle)
        document.addEventListener('keyup', keyupHandle)
        window.addEventListener('focus', focusHandle)
    }

    keycodeToCharacter(_keycode)
    {
        let character = this.knownKeyNames[ _keycode ]

        if(!character)
        {
            character = String.fromCharCode(_keycode).toLowerCase()
        }

        return character
    }

    isDown(_inputs, _downItems = null)
    {
        const downItems = _downItems !== null ? _downItems : this.downItems
        let inputs = _inputs instanceof Array ? _inputs : [ _inputs ]
        inputs = inputs.map((_item) => typeof _item === 'number' ? this.keycodeToCharacter(_item) : _item)

        return inputs.every((_item) =>
        {
            return downItems.includes(_item)
        })
    }
}
