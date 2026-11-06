import { SlashCommandBuilder } from 'discord.js'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import ApplicationCommand from '../templates/ApplicationCommand.js'

const run = promisify(execFile)

export default new ApplicationCommand({
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop the Enshrouded server'),
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
            if (stdout.trim() !== 'true') {
                await interaction.editReply('🔴 Server is already stopped.')
                return
            }
            await interaction.editReply(
                '🟡 Stopping server and saving the world, this can take up to 90 seconds...'
            )
            await run('docker', ['stop', '-t', '90', container])
            await interaction.editReply('🔴 Server stopped.')
        } catch (err) {
            await interaction.editReply(
                `❌ Failed to stop: ${(err as Error).message}`
            )
        }
    }
})
