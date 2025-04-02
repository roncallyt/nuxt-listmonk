<template>
  <div>
    <ListmonkForm>
      <ListmonkInputGroup
        id="input-email"
        label="E-mail"
      >
        <template #default="inputProps">
          <ListmonkInput
            :id="inputProps.id"
            field="email"
            type="email"
            required
          />
        </template>
      </ListmonkInputGroup>

      <ListmonkInputGroup
        id="input-name"
        label="Name"
      >
        <template #default="inputProps">
          <ListmonkInput
            :id="inputProps.id"
            field="name"
          />
        </template>
      </ListmonkInputGroup>

      <ListmonkButton title="Send" />
    </ListmonkForm>
  </div>
</template>
