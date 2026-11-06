import { SlashCommandBuilder } from 'discord.js'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import ApplicationCommand from '../templates/ApplicationCommand.js'

const run = promisify(execFile)

export default new ApplicationCommand({
    data: new SlashCommandBuilder()
        .setName('start')
        .setDescription('Start the Enshrouded server'),
    async execute(interaction): Promise<void> {
        await interaction.deferReply()
        const container = process.env.CONTAINER_NAME as string
        try {
            const { stdout } = await run('docker', [
                'inspect',
                '-f',
                '{{.State.Running}}',
                container
            ])
            if (stdout.trim() === 'true') {
                await interaction.editReply('🟢 Server is already running.')
                return
            }
            await run('docker', ['start', container])
            await interaction.editReply(
                '🟢 Server is starting! Give it a minute or two.'
            )
        } catch (err) {
            const error = err as Error & { stderr?: string }
            await interaction.editReply(
                `❌ Failed to start: ${error.stderr?.trim() || error.message}`
            )
        }
    }
})
