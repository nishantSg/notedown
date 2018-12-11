import Position from './Position.js'
import Line from './Line.js'

export default class Lines
{
    constructor(_options)
    {
        this.root = _options.root
        this.root.lines = this

        // Container
        this.$element = document.createElement('div')
        this.$element.classList.add('lines')
        this.root.scroll.$inner.appendChild(this.$element)

        // Set up
        this.items = []
        this.length = 0
    }

    addLine(_text = '')
    {
        const line = new Line(_text)

        this.$element.appendChild(line.$element)

        this.items.push(line)

        this.length = this.items.length

        return line
    }

    removeLine(_line)
    {
        const lineIndex = this.items.indexOf(_line)

        // Found
        if(lineIndex !== - 1)
        {
            _line.$element.remove()
            this.items.splice(lineIndex, 1)

            this.length = this.items.length
        }
    }

    getPosition(_x, _y)
    {
        const position = new Position()

        let beforeFirstLine = false
        let afterLastLine = false

        /**
         * Line
         */
        position.lineIndex = Math.floor(_y / this.root.measures.lineHeight)

        // Before first line
        if(position.lineIndex < 0)
        {
            beforeFirstLine = true
            position.lineIndex = 0
        }

        // After last line
        else if(position.lineIndex > this.items.length - 1)
        {
            afterLastLine = true
            position.lineIndex = this.items.length - 1
        }

        /**
         * Row
         */
        // Before first line
        if(beforeFirstLine)
        {
            position.rowIndex = 0
        }
        // After last line
        else if(afterLastLine)
        {
            // Has no line
            if(this.items.length === 0)
            {
                position.rowIndex = 0
            }
            // Last line
            else
            {
                const lastLine = this.items[this.items.length - 1]
                position.rowIndex = lastLine.text.length
            }
        }
        // Between first and last line
        else
        {
            position.rowIndex = Math.round(_x / this.root.measures.rowWidth)

            const line = this.items[position.lineIndex]

            if(position.rowIndex < 0)
            {
                position.rowIndex = 0
            }
            else if(position.rowIndex > line.text.length)
            {
                position.rowIndex = line.text.length
            }
        }

        return position
    }

    removeRange(_range)
    {
        let start = null
        let end = null

        if(_range.start.lineIndex !== _range.end.lineIndex)
        {
            start = _range.start.lineIndex < _range.end.lineIndex ? _range.start : _range.end
            end = _range.start.lineIndex < _range.end.lineIndex ? _range.end : _range.start
        }
        else
        {
            start = _range.start.rowIndex < _range.end.rowIndex ? _range.start : _range.end
            end = _range.start.rowIndex < _range.end.rowIndex ? _range.end : _range.start
        }

        const lines = this.items.slice(start.lineIndex, end.lineIndex + 1)

        // One line
        if(lines.length === 1)
        {
            const line = lines[0]
            line.removeText(start.rowIndex, end.rowIndex)
        }
        else
        {
            // Update first line using first and last line
            const firstLine = lines[0]
            const lastLine = lines[lines.length - 1]

            const before = firstLine.text.slice(0, start.rowIndex)
            const after = lastLine.text.slice(end.rowIndex, lastLine.text.length)
            const text = `${before}${after}`

            firstLine.updateText(text)

            // Remove other lines
            for(let i = 1; i < lines.length; i++)
            {
                const line = lines[i]
                this.removeLine(line)
            }
        }
    }

    addText(_text, _destination)
    {
        if(_destination instanceof Position)
        {
            this.addTextAtPosition(_text, _destination)
        }
        else if(_destination instanceof Range)
        {
            this.addTextAtRange(_text, _destination)
        }
    }

    addTextAtPosition(_text, _position)
    {
        // Find line
        const line = this.items[_position.lineIndex]

        line.addText(_text, _position.rowIndex)
    }

    addTextAtRange(_text, _range)
    {
        // Remove range
        this.removeRange(_range)

        // Add text
        this.addTextAtPosition(_text, _range.start)
    }

    getText(_range)
    {
        const range = _range.clone().normalize()
        const lines = this.items.slice(range.start.lineIndex, range.end.lineIndex + 1)

        if(lines.length === 1)
        {
            const line = lines[0]

            if(range.isEmpty())
            {
                return line.text
            }
            else
            {
                return line.text.slice(range.start.rowIndex, range.end.rowIndex)
            }
        }
        else
        {
            const textParts = []

            for(let i = 0; i < lines.length; i++)
            {
                const line = lines[i]

                if(i === 0)
                {
                    textParts.push(line.text.slice(range.start.rowIndex, line.length))
                }
                else if(i === lines.length - 1)
                {
                    textParts.push(line.text.slice(0, range.end.rowIndex))
                }
                else
                {
                    textParts.push(line.text)
                }
            }

            return textParts.join('\n')
        }
    }
}
