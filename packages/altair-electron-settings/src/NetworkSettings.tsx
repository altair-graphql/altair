import { Radio, Label, Button, TextInput } from 'flowbite-react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { ipcRenderer as ipc } from 'electron';
import {
  SETTINGS_STORE_EVENTS,
  SettingStore,
} from '@altairgraphql/electron-interop';

export function NetworkSettings() {
  const initialData =
    ipc.sendSync(SETTINGS_STORE_EVENTS.GET_SETTINGS_DATA) || {};
  console.log(initialData);
  const { register, handleSubmit, watch } = useForm<SettingStore['settings']>({
    defaultValues: initialData,
  });
  const onSubmit: SubmitHandler<SettingStore['settings']> = data => {
    console.log(data);
    ipc.sendSync(SETTINGS_STORE_EVENTS.UPDATE_SETTINGS_DATA, data);
    ipc.sendSync('from-renderer:restart-app');
  };

  return (
    <div className="ml-64 p-4">
      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset className="flex max-w-md flex-col gap-4">
          <legend className="mb-4">Configure proxy</legend>
          <div className="flex items-center gap-2">
            <Radio
              id="proxy-none"
              value="none"
              {...register('proxy_setting')}
            />
            <Label htmlFor="proxy-none">No proxy</Label>
          </div>
          <div className="flex items-center gap-2">
            <Radio
              id="proxy-autodetect"
              value="autodetect"
              {...register('proxy_setting')}
            />
            <Label htmlFor="proxy-autodetect">Auto-detect proxy settings</Label>
          </div>
          <div className="flex items-center gap-2">
            <Radio
              id="proxy-system"
              value="system"
              {...register('proxy_setting')}
            />
            <Label htmlFor="proxy-system">Use system proxy settings</Label>
          </div>
          <div className="flex items-center gap-2">
            <Radio id="proxy-pac" value="pac" {...register('proxy_setting')} />
            <Label htmlFor="proxy-pac">
              Use automatic configuration script
            </Label>
          </div>
          {watch('proxy_setting') === 'pac' && (
            <div className="ml-8 nested">
              <TextInput
                type="text"
                placeholder="Address URL"
                {...register('pac_address')}
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <Radio
              id="proxy-proxyserver"
              value="proxy_server"
              {...register('proxy_setting')}
            />
            <Label htmlFor="proxy-proxyserver">
              Use proxy server for connections
            </Label>
          </div>
          {watch('proxy_setting') === 'proxy_server' && (
            <div className="ml-8 nested flex items-center gap-2">
              <TextInput
                type="text"
                placeholder="Host"
                {...register('proxy_host')}
              />
              <TextInput
                type="text"
                placeholder="Port"
                {...register('proxy_port')}
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <Radio
              id="proxy-unixsocket"
              value="proxy_unix_socket"
              {...register('proxy_setting')}
            />
            <Label htmlFor="proxy-unixsocket">
              Use Unix domain socket proxy
            </Label>
          </div>
          {watch('proxy_setting') === 'proxy_unix_socket' && (
            <div className="ml-8 nested flex flex-col gap-2">
              <TextInput
                type="text"
                placeholder="Socket path (e.g., /var/run/proxy.sock)"
                {...register('proxy_unix_socket_path')}
              />
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Radio
                    id="socket-type-http"
                    value="http"
                    {...register('proxy_unix_socket_type')}
                  />
                  <Label htmlFor="socket-type-http">HTTP</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Radio
                    id="socket-type-socks5"
                    value="socks5"
                    {...register('proxy_unix_socket_type')}
                  />
                  <Label htmlFor="socket-type-socks5">SOCKS5</Label>
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button type="submit">Save and restart</Button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
