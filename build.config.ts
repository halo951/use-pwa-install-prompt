import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
    entries: [{ name: 'index', input: 'src/index' }],
    clean: true,
    declaration: true,
    rollup: {
        emitCJS: true
    }
})
